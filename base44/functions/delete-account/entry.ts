// Delete the caller's account and wipe all their app data.
// Auth verifies the caller via base44.auth.me(). The service role is used for the
// deletes because several entities (PremiumEntitlement, Base44Purchase) are
// admin-only for writes under RLS, so a user-scoped delete would be blocked.
// Each delete is filtered by the owning field for that entity so no other user's
// data is touched. The User record itself is deleted last, best-effort.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

type EntityLike = { deleteMany: (query: Record<string, unknown>) => Promise<unknown> };

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;
    const db = base44.asServiceRole;

    const safeDelete = async (label: string, ent: EntityLike, filter: Record<string, unknown>) => {
      try {
        await ent.deleteMany(filter);
      } catch (e) {
        console.error(`delete-account: ${label} failed`, e);
      }
    };

    // Records owned via created_by_id
    await safeDelete("transactions", db.entities.Transaction, { created_by_id: userId });
    await safeDelete("savingsGoals", db.entities.SavingsGoal, { created_by_id: userId });
    await safeDelete("budgets", db.entities.CategoryBudget, { created_by_id: userId });
    await safeDelete("loans", db.entities.Loan, { created_by_id: userId });
    await safeDelete("bills", db.entities.BillReminder, { created_by_id: userId });

    // Records owned via user_id
    await safeDelete("notifications", db.entities.BillNotification, { user_id: userId });
    await safeDelete("entitlements", db.entities.PremiumEntitlement, { user_id: userId });

    // Purchases: owned via appUserId (set at checkout) or created_by_id
    await safeDelete("purchases", db.entities.Base44Purchase, {
      $or: [{ appUserId: userId }, { created_by_id: userId }],
    });

    // Finally, the User record itself (platform-managed — best-effort).
    let userDeleted = false;
    try {
      await db.entities.User.delete(userId);
      userDeleted = true;
    } catch (e) {
      console.error("delete-account: user record delete failed", e);
    }

    return Response.json({ ok: true, userDeleted });
  } catch (error) {
    console.error("delete-account error", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}