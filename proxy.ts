import { NextRequest, NextResponse } from "next/server";
import { authConfiguration } from "./lib/auth";
import { isApiRequest, isPublicRequest, noStore } from "./lib/auth-policy";
import { currentVerificationTarget } from "./lib/verification/runtime";
import { createNonce, NONCE_COOKIE, cookieValues, VERIFICATION_COOKIE } from "./lib/verification/cookies";
import { readCryptographicSession, readSession } from "./lib/session";

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
  let verificationNonce: string | null = null;
  try {
    // A canonical configured origin, never a client-supplied Host, owns all redirects.
    const verificationEntry = pathname === "/verification" && ["GET", "HEAD"].includes(request.method);
    const verificationEnabled = verificationEntry && currentVerificationTarget() !== null;
    if (verificationEnabled) verificationNonce = createNonce(authConfiguration().secret);
    const publicRequest = isPublicRequest(pathname, request.method) || verificationEnabled;
    const signOut = (pathname === "/sign-out" && ["GET", "HEAD"].includes(request.method)) || (pathname === "/api/auth/sign-out" && request.method === "POST");
    const accepting = pathname === "/api/invitations/accept" && request.method === "POST";
    const identityOnly = signOut || accepting;
    const admitted = publicRequest || identityOnly ? null : await readSession(request.headers);
    const session = identityOnly ? await readCryptographicSession(request.headers) : admitted;
    const onboarding = pathname === "/onboarding" || pathname === "/api/onboarding/provision" || pathname === "/api/invitations/accept";
    if (verificationEntry && !verificationEnabled) {
      response = NextResponse.json({ error: "Not found" }, { status: 404 });
    } else if (!publicRequest && !session && !(signOut && cookieValues(request.headers.get("cookie"), VERIFICATION_COOKIE).length > 0)) {
      response = isApiRequest(pathname) || !["GET", "HEAD"].includes(request.method)
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(new URL("/sign-in", origin));
    } else if (!publicRequest && !signOut && admitted && admitted.access.kind !== "member" && !onboarding) {
      response = isApiRequest(pathname) || !["GET", "HEAD"].includes(request.method)
        ? NextResponse.json({ error: "Family membership required" }, { status: 403 })
        : NextResponse.redirect(new URL("/onboarding", origin));
    } else {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Content-Security-Policy", csp);
      requestHeaders.delete("x-mp-verification-nonce");
      if (verificationNonce) requestHeaders.set("x-mp-verification-nonce", verificationNonce);
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }
  } catch {
    response = NextResponse.json({ error: "Authentication unavailable" }, { status: 503 });
  }
  if (verificationNonce) response.cookies.set(NONCE_COOKIE, verificationNonce, { secure: true, httpOnly: true, sameSite: "lax", path: "/", maxAge: 300 });
  for (const [name, value] of Object.entries(noStore)) response.headers.set(name, value);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", verificationNonce ? "same-origin" : "no-referrer");
  if (origin.startsWith("https:")) response.headers.set("Strict-Transport-Security", "max-age=31536000");
  return response;
}

// Menu handlers independently preserve every gate/header without Next's Proxy
// body cloning, which otherwise waits for client EOF before route deadlines run.
export const config = { matcher: "/((?!api/menu(?:/[^/]+/remove)?/?$|api/verification/session$).*)" };
