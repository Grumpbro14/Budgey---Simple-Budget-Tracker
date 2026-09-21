import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from "base44:runtime";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const password = secrets.get("ADMIN_PANEL_PASSWORD") || "";
    if (!password) return Response.json({ ok: false, error: "Panel password not configured" }, { status: 500 });
    if (body.password === password) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "Wrong password" }, { status: 401 });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}