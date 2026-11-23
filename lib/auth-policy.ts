export const noStore = { "Cache-Control": "private, no-store", Pragma: "no-cache" };

export function isPublicRequest(path: string, method: string) {
  return (
    ((path === "/sign-in" || path.startsWith("/_next/static/")) && ["GET", "HEAD"].includes(method)) ||
    (path === "/api/auth/sign-in/social" && method === "POST") ||
    (path === "/api/auth/callback/google" && method === "GET")
  );
}

export function isApiRequest(path: string) {
  return path === "/api" || path.startsWith("/api/");
}
