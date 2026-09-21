// Weekly Summary Email — runs every Monday via cron automation (function.jsonc).
// For each user with an email address:
//   1. Sums their expense transactions from the past 7 days.
//   2. Lists their active bill reminders due in the next 7 days.
//   3. Sends a Budgie-branded HTML email with both sections.
//
// No user auth — this is a platform-scheduled task using the service role.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { getTodayInTimezone } from "../../shared/billUtils.ts";
import { verifyCronRequest } from "../../shared/cronAuth.ts";

export default async function (req: Request): Promise<Response> {
  try {
    // Verify the caller is authorized (shared secret) before doing any work.
    const body = await req.json().catch(() => ({}));
    const authError = verifyCronRequest(req, body);
    if (authError) return authError;

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    const appUrl = Deno.env.get("WIX_CHECKOUT_APP_URL") || "";

    // Fetch all users (paginated high limit for safety).
    const users = await db.entities.User.list("-created_date", 500);

    let emailsSent = 0;
    let usersProcessed = 0;

    for (const user of users || []) {
      usersProcessed++;
      const userId = user.id;
      const email = user?.email;
      if (!email) continue;

      const timezone = (user?.timezone as string) || "UTC";
      const todayStr = getTodayInTimezone(timezone);

      // Compute date range: past 7 days for spending, next 7 days for bills.
      const today = new Date(todayStr + "T00:00:00Z");
      const weekAgo = new Date(today);
      weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
      const weekAhead = new Date(today);
      weekAhead.setUTCDate(weekAhead.getUTCDate() + 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];
      const weekAheadStr = weekAhead.toISOString().split("T")[0];

      // Fetch this week's expenses and upcoming bills in parallel.
      let expenses: any[] = [];
      let upcomingBills: any[] = [];
      try {
        [expenses, upcomingBills] = await Promise.all([
          db.entities.Transaction.filter({
            created_by_id: userId,
            type: "expense",
            date: { $gte: weekAgoStr, $lte: todayStr },
          }),
          db.entities.BillReminder.filter({
            created_by_id: userId,
            status: "active",
            due_date: { $gte: todayStr, $lte: weekAheadStr },
          }, "due_date", 50),
        ]);
      } catch (e) {
        console.error("weekly-summary-email: data fetch failed for user", userId, e);
        continue;
      }

      // Skip users with no spending AND no upcoming bills (nothing to report).
      const totalSpending = (expenses || []).reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );
      if (totalSpending === 0 && (upcomingBills || []).length === 0) continue;

      // Build and send the email.
      try {
        await db.integrations.Core.SendEmail({
          to: email,
          subject: "Your Weekly Budgie Summary",
          html: buildEmailHtml(totalSpending, expenses || [], upcomingBills || [], todayStr, weekAgoStr, appUrl),
          text: buildPlainText(totalSpending, expenses || [], upcomingBills || [], todayStr, weekAgoStr),
        });
        emailsSent++;
        console.log("weekly-summary-email: sent to", email);
      } catch (e) {
        console.error("weekly-summary-email: email send failed for user", userId, e);
      }
    }

    return Response.json({ ok: true, usersProcessed, emailsSent });
  } catch (error) {
    console.error("weekly-summary-email: unhandled error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildEmailHtml(
  totalSpending: number,
  expenses: any[],
  bills: any[],
  todayStr: string,
  weekAgoStr: string,
  appUrl: string
): string {
  const spendingStr = totalSpending.toFixed(2);
  const rangeStr = formatDateRange(weekAgoStr, todayStr);

  // Top spending categories (group by category, sum amounts).
  const byCategory: Record<string, number> = {};
  for (const t of expenses) {
    const cat = t.category || "Other";
    byCategory[cat] = (byCategory[cat] || 0) + Number(t.amount || 0);
  }
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const categoryRows = topCategories.length
    ? topCategories
        .map(
          ([cat, amt]) =>
            `<tr><td style="color:#666;font-weight:600;font-size:14px;padding:6px 0;">${escapeHtml(capitalize(cat))}</td><td style="font-weight:900;font-size:14px;text-align:right;padding:6px 0;">$${amt.toFixed(2)}</td></tr>`
        )
        .join("")
    : `<tr><td style="color:#aaa;font-size:14px;padding:6px 0;">No spending recorded</td><td></td></tr>`;

  // Upcoming bills list.
  const billRows = bills.length
    ? bills
        .map((b) => {
          const dueDate = new Date(b.due_date + "T00:00:00");
          const dueStr = dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return `<tr><td style="font-weight:700;font-size:14px;padding:6px 0;">${escapeHtml(b.name)}</td><td style="color:#888;font-size:13px;text-align:center;padding:6px 0;">${dueStr}</td><td style="font-weight:900;font-size:14px;color:#f25334;text-align:right;padding:6px 0;">$${Number(b.amount || 0).toFixed(2)}</td></tr>`;
        })
        .join("")
    : `<tr><td style="color:#aaa;font-size:14px;padding:6px 0;">No bills due this week</td><td></td><td></td></tr>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:Roboto,Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">
<div style="background:#fff;border-radius:24px;border:2px solid #e8e8e0;overflow:hidden;">
<div style="background:linear-gradient(135deg,#f25334,#f5a623);padding:28px 24px;text-align:center;">
<div style="font-size:36px;margin-bottom:4px;">🐦</div>
<h1 style="color:#fff;font-size:20px;font-weight:900;margin:0;letter-spacing:-0.02em;">Your Weekly Summary</h1>
<p style="color:#fff;font-size:13px;margin:4px 0 0;opacity:0.9;">${rangeStr}</p>
</div>
<div style="padding:24px;">
<div style="background:#fff4ed;border-radius:16px;padding:20px;margin:0 0 20px;text-align:center;">
<p style="font-size:13px;color:#888;font-weight:600;margin:0 0 4px;">Total Spending This Week</p>
<p style="font-size:32px;font-weight:900;color:#f25334;margin:0;">$${spendingStr}</p>
</div>
<h2 style="font-size:15px;font-weight:900;margin:0 0 12px;color:#2c2c2c;">Top Spending Categories</h2>
<table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
${categoryRows}
</table>
<h2 style="font-size:15px;font-weight:900;margin:0 0 12px;color:#2c2c2c;">Upcoming Bills This Week</h2>
<table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
<tr style="border-bottom:1px solid #eee;"><td style="color:#888;font-weight:600;font-size:12px;padding:0 0 6px;">Bill</td><td style="color:#888;font-weight:600;font-size:12px;text-align:center;padding:0 0 6px;">Due</td><td style="color:#888;font-weight:600;font-size:12px;text-align:right;padding:0 0 6px;">Amount</td></tr>
${billRows}
</table>
<a href="${appUrl}" style="display:block;background:#f25334;color:#fff;text-align:center;text-decoration:none;font-weight:900;font-size:16px;padding:14px;border-radius:16px;">Open Budgie</a>
<p style="font-size:11px;color:#aaa;text-align:center;margin:12px 0 0;">You're receiving this weekly summary from Budgie.</p>
</div>
</div>
</div>
</body></html>`;
}

function buildPlainText(
  totalSpending: number,
  expenses: any[],
  bills: any[],
  todayStr: string,
  weekAgoStr: string
): string {
  const lines: string[] = [];
  lines.push("Your Weekly Budgie Summary");
  lines.push(`${formatDateRange(weekAgoStr, todayStr)}`);
  lines.push("");
  lines.push(`Total Spending: $${totalSpending.toFixed(2)}`);
  lines.push("");
  lines.push("Upcoming Bills This Week:");
  if (bills.length) {
    for (const b of bills) {
      lines.push(`  - ${b.name}: $${Number(b.amount || 0).toFixed(2)} (due ${b.due_date})`);
    }
  } else {
    lines.push("  No bills due this week.");
  }
  return lines.join("\n");
}

function formatDateRange(weekAgoStr: string, todayStr: string): string {
  const start = new Date(weekAgoStr + "T00:00:00");
  const end = new Date(todayStr + "T00:00:00");
  const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startStr} – ${endStr}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str: string): string {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}