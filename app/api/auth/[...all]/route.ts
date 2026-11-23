import { NextRequest, NextResponse } from "next/server";
import { authConfiguration, getAuth } from "../../../../lib/auth";
import { contextCookie } from "../../../../lib/invitation-context";
import { noStore } from "../../../../lib/auth-policy";
import { readCryptographicSession } from "../../../../lib/session";

export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const social = path === "/api/auth/sign-in/social" && request.method === "POST";
  const callback = path === "/api/auth/callback/google" && request.method === "GET";
  const logout = path === "/api/auth/sign-out" && request.method === "POST";
  if (!social && !callback && !logout) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });
  try {
    const { origin } = authConfiguration();
    let forwarded: Request = request;
    if (social || logout) {
      if (request.headers.get("origin") !== origin || request.headers.get("sec-fetch-site") === "cross-site") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: noStore });
      }
      if (logout && !await readCryptographicSession(request.headers)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
      if (request.headers.get("content-type")?.split(";")[0] !== "application/json" || Number(request.headers.get("content-length")) > 4096) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
      }
      const text = await request.text();
      if (Buffer.byteLength(text) > 4096) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
      let body: unknown;
      try { body = JSON.parse(text); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore }); }
      if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
      const fields = body as Record<string, unknown>;
      if (social && (
        fields.provider !== "google" ||
        Object.keys(fields).some((key) => !["provider", "callbackURL", "errorCallbackURL"].includes(key)) ||
        (fields.callbackURL !== undefined && fields.callbackURL !== "/onboarding") ||
        (fields.errorCallbackURL !== undefined && fields.errorCallbackURL !== "/sign-in")
      ) || logout && Object.keys(fields).length !== 0) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
      }
      forwarded = new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify(social ? { provider: "google", callbackURL: `${origin}/onboarding`, errorCallbackURL: `${origin}/sign-in`, newUserCallbackURL: `${origin}/onboarding` } : {}),
      });
    }
    // Use the HTTP handler so the library also enforces its origin/CSRF/OAuth checks.
    const response = await getAuth().handler(forwarded);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(noStore)) headers.set(name, value);
    if (callback && headers.has("location")) {
      const destination = new URL(headers.get("location")!, origin);
      if (destination.origin !== origin || destination.pathname !== "/onboarding") headers.set("location", `${origin}/sign-in?error=1`);
    }
    if (logout) headers.append("Set-Cookie", contextCookie(origin, null));
    if (response.status >= 400) return NextResponse.json({ error: "Authentication failed" }, { status: response.status, headers });
    return new Response(response.body, { status: response.status, headers });
  } catch {
    return NextResponse.json({ error: "Authentication unavailable" }, { status: 503, headers: noStore });
  }
}

export const GET = handle;
export const POST = handle;
