// Bill Reminders CRUD.
// Free users can create up to 1 bill reminder; Premium users get unlimited.
// Create enforces the free limit server-side. Update/delete/markPaid are owner-only
// (enforced by RLS on BillReminder), so free users can manage their 1 free bill.
// Premium status is verified server-side via the user's PremiumEntitlement row.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { advanceDate } from "../../shared/billUtils.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Server-side Premium check: free users can create up to 1 bill reminder; Premium unlimited.
    // RLS on PremiumEntitlement (read: data.user_id == user.id) returns only the caller's own row.
    const entitlements = await base44.entities.PremiumEntitlement.filter({});
    const isPremium = !!(entitlements && entitlements.length);

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ---- CREATE ----
    if (action === "create") {
      if (!isPremium) {
        const existing = await base44.entities.BillReminder.filter({});
        if (existing && existing.length >= 1) {
          return Response.json({ error: "Free plan limited to 1 bill reminder" }, { status: 403 });
        }
      }
      const data = body.data || {};
      const bill = await base44.entities.BillReminder.create({
        name: String(data.name || ""),
        amount: Number(data.amount || 0),
        due_date: String(data.due_date || ""),
        recurring: String(data.recurring || "none"),
        notes: data.notes ? String(data.notes) : "",
        reminder_enabled: data.reminder_enabled !== false,
        reminder_method: String(data.reminder_method || "email"),
        reminder_sent: false,
        status: "active",
      });
      return Response.json({ bill });
    }

    // ---- UPDATE ----
    if (action === "update") {
      const updateData: Record<string, unknown> = { ...(body.data || {}) };
      // If the due date changed, reset reminder_sent so the new cycle gets a fresh reminder.
      if (updateData.due_date) {
        updateData.reminder_sent = false;
      }
      const bill = await base44.entities.BillReminder.update(body.id, updateData);
      return Response.json({ bill });
    }

    // ---- DELETE ----
    if (action === "delete") {
      await base44.entities.BillReminder.delete(body.id);
      return Response.json({ ok: true });
    }

    // ---- MARK PAID ----
    // For recurring bills: advance to the next occurrence and reset reminder_sent.
    // For one-time bills: set status to "paid".
    if (action === "markPaid") {
      const bill = await base44.entities.BillReminder.get(body.id);
      if (!bill) return Response.json({ error: "Not found" }, { status: 404 });
      if (bill.recurring && bill.recurring !== "none") {
        const nextDate = advanceDate(bill.due_date, bill.recurring);
        const updated = await base44.entities.BillReminder.update(body.id, {
          due_date: nextDate,
          reminder_sent: false,
        });
        return Response.json({ bill: updated });
      } else {
        const updated = await base44.entities.BillReminder.update(body.id, { status: "paid" });
        return Response.json({ bill: updated });
      }
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("manage-bill-reminders error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}