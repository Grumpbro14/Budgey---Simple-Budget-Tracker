import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const OWNER_EMAIL = Deno.env.get("OWNER_EMAIL") || "";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const { userId, userEmail, userName, reason, severity } = body;
    if (!userId || !reason) return Response.json({ ok: false, error: "Missing fields" }, { status: 400 });

    const action = await base44.asServiceRole.entities.ModerationAction.create({
      user_id: userId,
      user_email: userEmail,
      user_name: userName || userEmail,
      type: "violation",
      reason,
      severity: Number(severity) || 0,
      active: true,
    });

    // Email the owner a notification in the requested format.
    const name = userName || userEmail || "A user";
    const subject = `Budgie violation alert: ${name}`;
    const textBody = `${name} violated ${reason} — it was ${Number(severity) || 0}%.\n\nThis has been recorded in your Admin Control Panel.`;
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: OWNER_EMAIL,
        subject,
        body: textBody,
      });
    } catch (e) {
      // Email failure must not roll back the recorded violation.
    }

    return Response.json({ ok: true, id: action.id });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}