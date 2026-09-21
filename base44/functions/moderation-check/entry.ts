import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    // Not logged in — nothing to enforce.
    if (!user) return Response.json({ blocked: false });
    // Admins are never blocked.
    if (user.role === "admin") {
      return Response.json({ blocked: false });
    }

    // Match by user id OR email, so a banned email can't get back in via a new account.
    const actions = await base44.asServiceRole.entities.ModerationAction.filter({
      $or: [ { user_id: user.id }, { user_email: user.email || "" } ]
    });

    const now = Date.now();
    let ban = null;
    let suspend = null;

    for (const a of actions || []) {
      if (a.type === "ban" && a.active !== false) { ban = a; break; }
    }
    if (!ban) {
      for (const a of actions || []) {
        if (a.type === "suspend" && a.active !== false) {
          if (!a.expires_at || new Date(a.expires_at).getTime() > now) { suspend = a; break; }
        }
      }
    }

    if (ban) {
      return Response.json({
        blocked: true,
        type: "ban",
        reason: ban.reason || "Banned for a Privacy Policy or Terms of Service violation"
      });
    }
    if (suspend) {
      return Response.json({
        blocked: true,
        type: "suspend",
        reason: suspend.reason || "Suspended for a Privacy Policy or Terms of Service violation",
        until: suspend.expires_at
      });
    }
    return Response.json({ blocked: false });
  } catch (error) {
    // Fail open: a function error must not lock users out of their own data.
    return Response.json({ blocked: false, error: error.message });
  }
}