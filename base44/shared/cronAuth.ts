// Shared secret verification for scheduled (cron) backend functions.
// Scheduled functions have public HTTP endpoints — without this check, anyone
// on the internet can trigger them.
//
// Authorization is granted if ANY of the following is true:
// 1. The request carries the platform's internal `base44-service-authorization`
//    header (present on scheduler and test-tool calls — not forgeable by
//    external callers).
// 2. The caller sends the `CRON_SHARED_SECRET` in the `x-cron-secret` header
//    (for authorized external callers).
// 3. The caller sends the secret in the JSON body `secret` field (for testing).
//
// All other callers receive 401 Unauthorized.

export function verifyCronRequest(req: Request, body: any): Response | null {
  // 1. Allow platform-internal calls (scheduler, test tool).
  const serviceAuth = req.headers.get("base44-service-authorization");
  if (serviceAuth) return null;

  // 2. For external callers, require the shared secret.
  const expectedSecret = Deno.env.get("CRON_SHARED_SECRET");
  if (!expectedSecret) {
    console.warn("cron-auth: CRON_SHARED_SECRET not set — rejecting external caller");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check header (preferred — used by authorized external callers)
  const headerSecret = req.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === expectedSecret) return null;

  // Check body (fallback — used by the test tool and manual testing)
  if (body && typeof body === "object" && body.secret === expectedSecret) return null;

  return Response.json({ error: "Unauthorized" }, { status: 401 });
}