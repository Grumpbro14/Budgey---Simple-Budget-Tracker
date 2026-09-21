// Scheduled Bill Reminder processor — runs hourly via cron automation (function.jsonc).
// For each active, reminder-enabled bill:
//   1. Verifies the owner has an active Premium entitlement (skips non-premium users).
//   2. If the bill is due "tomorrow" in the user's timezone and the reminder hasn't been sent
//      this cycle, sends the reminder via email and/or in-app notification (per reminder_method).
//   3. If a recurring bill's due date has passed, advances it to the next occurrence and resets
//      reminder_sent so the next cycle gets a fresh reminder.
//
// Idempotent: the reminder_sent flag prevents duplicate reminders no matter how often this runs.
// No user auth — this is a platform-scheduled task using the service role.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { advanceDate, getTodayInTimezone, getTomorrowInTimezone } from "../../shared/billUtils.ts";
import { verifyCronRequest } from "../../shared/cronAuth.ts";

export default async function (req: Request): Promise<Response> {
  try {
    // Verify the caller is authorized (shared secret) before doing any work.
    const body = await req.json().catch(() => ({}));
    const authError = verifyCronRequest(req, body);
    if (authError) return authError;

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    // Fetch all active, reminder-enabled bills (paginated high limit for safety).
    const bills = await db.entities.BillReminder.filter(
      { reminder_enabled: true, status: "active" },
      "-due_date",
      500
    );

    const appUrl = Deno.env.get("WIX_CHECKOUT_APP_URL") || "";
    let processed = 0;
    let remindersSent = 0;
    let advanced = 0;

    // Cache user info + premium status per user to avoid repeated lookups.
    const userCache: Record<string, { email: string | null; timezone: string; hasPremium: boolean }> = {};

    for (const bill of bills || []) {
      processed++;
      const userId = bill.created_by_id;
      if (!userId) continue;

      // Lazy-load user info + premium check.
      if (!(userId in userCache)) {
        try {
          const [user, entitlements] = await Promise.all([
            db.entities.User.get(userId),
            db.entities.PremiumEntitlement.filter({ user_id: userId }),
          ]);
          userCache[userId] = {
            email: user?.email ?? null,
            timezone: (user?.timezone as string) || "UTC",
            hasPremium: !!(entitlements && entitlements.length > 0),
          };
        } catch (e) {
          console.error("process-bill-reminders: error loading user", userId, e);
          userCache[userId] = { email: null, timezone: "UTC", hasPremium: false };
        }
      }

      const userInfo = userCache[userId];
      if (!userInfo.hasPremium) continue; // Skip non-premium users — no reminders.

      const todayStr = getTodayInTimezone(userInfo.timezone);
      const tomorrowStr = getTomorrowInTimezone(userInfo.timezone);

      // --- Send reminder if due tomorrow and not yet sent this cycle ---
      if (bill.due_date === tomorrowStr && !bill.reminder_sent) {
        const amountStr = Number(bill.amount || 0).toFixed(2);
        const title = `🐦 Budgie Reminder: Your ${bill.name} bill of $${amountStr} is due tomorrow.`;

        const method = bill.reminder_method || "email";
        const sendEmail = method === "email" || method === "both";
        const sendInApp = method === "push" || method === "both";

        // Email reminder
        if (sendEmail && userInfo.email) {
          try {
            await db.integrations.Core.SendEmail({
              to: userInfo.email,
              subject: `Budgie Reminder: ${bill.name} due tomorrow`,
              html: buildEmailHtml(bill, amountStr, appUrl),
              text: `Your ${bill.name} bill of $${amountStr} is due on ${bill.due_date} (tomorrow). Open Budgie: ${appUrl}`,
            });
          } catch (e) {
            console.error("process-bill-reminders: email send failed for bill", bill.id, e);
          }
        }

        // In-app notification (stored in DB — always works, shown via bell dropdown)
        if (sendInApp) {
          try {
            await db.entities.BillNotification.create({
              user_id: userId,
              bill_id: bill.id,
              title,
              body: `Your ${bill.name} bill of $${amountStr} is due on ${bill.due_date}.`,
              bill_name: bill.name,
              amount: bill.amount,
              due_date: bill.due_date,
              read: false,
            });
          } catch (e) {
            console.error("process-bill-reminders: notification create failed for bill", bill.id, e);
          }

          // Push notification (requires native mobile build with push credentials — may fail silently)
          try {
            await db.integrations.Core.SendPushNotification({
              user_id: userId,
              title: "Budgie Reminder",
              content: title,
              action_label: "Open Budgie",
              action_url: appUrl,
            });
          } catch (e) {
            // Expected to fail if no native mobile build is configured — not an error.
            console.log("process-bill-reminders: push skipped for bill", bill.id, "(no mobile build?)");
          }
        }

        // Mark as sent LAST so a failure above leaves reminder_sent=false for retry.
        await db.entities.BillReminder.update(bill.id, { reminder_sent: true });
        remindersSent++;
        console.log("process-bill-reminders: sent reminder for bill", bill.id, "to user", userId);
      }

      // --- Advance recurring bills whose due date has passed ---
      if (bill.due_date < todayStr && bill.recurring && bill.recurring !== "none") {
        const nextDate = advanceDate(bill.due_date, bill.recurring);
        await db.entities.BillReminder.update(bill.id, {
          due_date: nextDate,
          reminder_sent: false,
        });
        advanced++;
        console.log("process-bill-reminders: advanced recurring bill", bill.id, "to", nextDate);
      }
    }

    return Response.json({ ok: true, processed, remindersSent, advanced });
  } catch (error) {
    console.error("process-bill-reminders: unhandled error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Budgie-branded HTML email template for bill reminders.
function buildEmailHtml(bill: any, amountStr: string, appUrl: string): string {
  const dueDate = new Date(bill.due_date + "T00:00:00");
  const dueStr = dueDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const notesHtml = bill.notes
    ? `<p style="font-size:13px;color:#888;margin:0 0 16px;padding:12px;background:#f9f9f4;border-radius:12px;">📝 ${escapeHtml(bill.notes)}</p>`
    : "";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Roboto,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">
<div style="background:#fff;border-radius:24px;border:2px solid #e8e8e0;overflow:hidden;">
<div style="background:linear-gradient(135deg,#f25334,#f5a623);padding:28px 24px;text-align:center;">
<div style="font-size:36px;margin-bottom:4px;">🐦</div>
<h1 style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.02em;">Budgie Reminder</h1>
</div>
<div style="padding:24px;">
<p style="font-size:16px;color:#2c2c2c;font-weight:600;margin:0 0 16px;line-height:1.5;">
Your <strong>${escapeHtml(bill.name)}</strong> bill is due tomorrow.
</p>
<div style="background:#fff8f0;border-radius:16px;padding:16px;margin:0 0 16px;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="color:#888;font-weight:600;font-size:14px;padding:4px 0;">Bill</td><td style="font-weight:900;font-size:14px;text-align:right;padding:4px 0;">${escapeHtml(bill.name)}</td></tr>
<tr><td style="color:#888;font-weight:600;font-size:14px;padding:4px 0;">Amount</td><td style="font-weight:900;font-size:14px;color:#f25334;text-align:right;padding:4px 0;">$${amountStr}</td></tr>
<tr><td style="color:#888;font-weight:600;font-size:14px;padding:4px 0;">Due Date</td><td style="font-weight:900;font-size:14px;text-align:right;padding:4px 0;">${dueStr}</td></tr>
</table>
</div>
${notesHtml}
<a href="${appUrl}" style="display:block;background:#f25334;color:#fff;text-align:center;text-decoration:none;font-weight:900;font-size:16px;padding:14px;border-radius:16px;">Open Budgie</a>
<p style="font-size:11px;color:#aaa;text-align:center;margin:12px 0 0;">You're receiving this because you set up a bill reminder in Budgie.</p>
</div>
</div>
</div>
</body></html>`;
}

function escapeHtml(str: string): string {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}