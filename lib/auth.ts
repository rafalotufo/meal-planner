import "server-only";
import { betterAuth } from "better-auth";
import { google, verifyGoogleIdToken } from "better-auth/social-providers";
import allowedGoogleEmails from "./allowed-google-emails.json";
import { isAllowedGoogleUser, validateGoogleAccessList } from "./google-access";

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
          if (!isAllowedGoogleUser({ email: claims.email, emailVerified: claims.email_verified }, allowedGoogleEmails)) return null;
          return provider.getUserInfo(tokens);
        },
      },
    },
    // Source: https://better-auth.com/docs/concepts/session-management#stateless-session-management
    session: {
      expiresIn: 3600,
      disableSessionRefresh: true,
      cookieCache: { enabled: true, maxAge: 3600, strategy: "jwe", refreshCache: false },
    },
    account: { storeStateStrategy: "cookie", storeAccountCookie: true, accountLinking: { enabled: false } },
    advanced: { useSecureCookies: config.origin.startsWith("https:") },
    onAPIError: { errorURL: `${config.origin}/sign-in` },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  // Configuration is server-owned; sessions are verified independently on every request.
  instance ??= createAuth();
  return instance;
}
