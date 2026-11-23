import { NextRequest, NextResponse } from "next/server";
import { authConfiguration } from "./lib/auth";
import { isApiRequest, isPublicRequest, noStore } from "./lib/auth-policy";
import { readSession } from "./lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let origin: string;
  try { origin = authConfiguration().origin; }
  catch { return NextResponse.json({ error: "Authentication unavailable" }, { status: 503, headers: noStore }); }

  if (request.headers.get("host") !== new URL(origin).host) {
    return NextResponse.json({ error: "Misdirected request" }, { status: 421, headers: noStore });
  }
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`;
  let response: NextResponse;
  try {
    // A canonical configured origin, never a client-supplied Host, owns all redirects.
    if (!isPublicRequest(pathname, request.method) && !await readSession(request.headers)) {
      response = isApiRequest(pathname) || !["GET", "HEAD"].includes(request.method)
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/sign-in", origin));
    } else {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Content-Security-Policy", csp);
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }
  } catch {
    response = NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
  }
  for (const [name, value] of Object.entries(noStore)) response.headers.set(name, value);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  if (origin.startsWith("https:")) response.headers.set("Strict-Transport-Security", "max-age=31536000");
  return response;
}

export const config = { matcher: "/:path*" };
