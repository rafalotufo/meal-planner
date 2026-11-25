import "server-only";
import { betterAuth } from "better-auth";
import { google, verifyGoogleIdToken } from "better-auth/social-providers";
import allowedGoogleEmails from "./allowed-google-emails.json";
import { validateGoogleAccessList } from "./google-access";
import { classifyAccess, updateVerifiedEmail, verifiedIdentity } from "./identity-access";
import { getDatabase } from "./db";

const GOOGLE_SESSION_SECONDS = 30 * 24 * 60 * 60;

export function authConfiguration() {
  validateGoogleAccessList(allowedGoogleEmails);
  const { BETTER_AUTH_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!BETTER_AUTH_URL || !BETTER_AUTH_SECRET || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Authentication is unavailable");
  }
  const url = new URL(BETTER_AUTH_URL);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
    (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) ||
    Buffer.byteLength(BETTER_AUTH_SECRET) < 32
  ) {
    throw new Error("Authentication is unavailable");
  }
  return { origin: url.origin, secret: BETTER_AUTH_SECRET, clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET };
}

function createAuth() {
  const config = authConfiguration();
  const googleOptions = { clientId: config.clientId, clientSecret: config.clientSecret, includeGrantedScopes: false };
  const provider = google(googleOptions);
  return betterAuth({
    appName: "Meal Planner",
    baseURL: config.origin,
    secret: config.secret,
    trustedOrigins: [config.origin],
    user: { additionalFields: { googleSubject: { type: "string", required: true, input: true, returned: true } } },
    telemetry: { enabled: false },
    logger: { disabled: true },
    socialProviders: {
      google: {
        ...googleOptions,
        async getUserInfo(tokens) {
          // The redirect callback normally trusts its HTTPS token backchannel.
          // Also require the library's signature/issuer/audience/expiry verifier.
          const claims = tokens.idToken ? await verifyGoogleIdToken({ token: tokens.idToken, audience: config.clientId }) : null;
          if (!claims || typeof claims.sub !== "string" || !claims.sub.trim() || typeof claims.email !== "string" || !claims.email.trim()) return null;
          const identity = verifiedIdentity({ googleSubject: claims.sub, email: claims.email, emailVerified: claims.email_verified });
          if (!identity) return null;
          const access = await classifyAccess(await getDatabase(), identity, allowedGoogleEmails);
          if (!access) return null;
          const info = await provider.getUserInfo(tokens);
          if (!info) return null;
          if (access.kind === "member") await updateVerifiedEmail(await getDatabase(), identity, allowedGoogleEmails);
          return { ...info, user: { ...info.user, googleSubject: identity.googleSubject, email: identity.email, emailVerified: true } };
        },
      },
    },
    // Source: https://better-auth.com/docs/concepts/session-management#stateless-session-management
    session: {
      expiresIn: GOOGLE_SESSION_SECONDS,
      disableSessionRefresh: true,
      cookieCache: { enabled: true, maxAge: GOOGLE_SESSION_SECONDS, strategy: "jwe", refreshCache: false },
    },
    account: { storeStateStrategy: "cookie", storeAccountCookie: true, accountLinking: { enabled: false } },
    advanced: {
      useSecureCookies: config.origin.startsWith("https:"),
      // Account data otherwise inherits the longer session cache lifetime.
      cookies: { account_data: { attributes: { maxAge: 3600 } } },
    },
    onAPIError: { errorURL: `${config.origin}/sign-in` },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  // Configuration is server-owned; sessions are verified independently on every request.
  instance ??= createAuth();
  return instance;
}
