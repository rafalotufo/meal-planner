import { resolve } from "node:path";

type Mode = "candidate" | "anonymous" | "disconnect" | "waf";
type Fetcher = (url: string, init: RequestInit) => Promise<Response>;
type Options = { origin: string; mode: Mode; fetchImpl?: Fetcher; sessionCookie?: string };
type Result = { mode: Mode; status: number | null; elapsedMs: number; pass: boolean | null };
const modes: readonly string[] = ["candidate", "anonymous", "disconnect", "waf"];

function deploymentOrigin(value: string): string {
  const match = /^https:\/\/([a-z0-9.-]+\.vercel\.app)\/?$/i.exec(value);
  if (!match || match[1].split(".").some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) {
    throw new Error("Invalid deployment origin");
  }
  return new URL(value).origin;
}

// Operator-only checks: never imported by the application or served as a route.
export async function runSmoke({ origin: input, mode, fetchImpl = fetch, sessionCookie }: Options): Promise<Result> {
  const origin = deploymentOrigin(input);
  if (!modes.includes(mode) || (mode === "disconnect" && !sessionCookie) ||
      (sessionCookie !== undefined && (!sessionCookie || sessionCookie.length > 16384 || /[^\x20-\x7e]/.test(sessionCookie) || !["candidate", "disconnect"].includes(mode)))) {
    throw new Error("Invalid smoke check options");
  }
  const start = Date.now();
  let status: number | null = null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), mode === "disconnect" ? 2000 : 10000);
  const result = (pass: boolean | null): Result => ({ mode, status, elapsedMs: Date.now() - start, pass });
  const request = async (path: string, { post = false, redirect = "error" as RequestRedirect } = {}) => {
    const headers = new Headers();
    if (sessionCookie) headers.set("Cookie", sessionCookie);
    if (post) { headers.set("Origin", origin); headers.set("Content-Type", "application/json"); }
    const init: RequestInit = { method: post ? "POST" : "GET", redirect, headers, signal: controller.signal };
    if (post) init.body = mode === "disconnect" ? JSON.stringify({ query: "potato gnocchi" }) : "{}";
    if (controller.signal.aborted) throw controller.signal.reason;
    let onAbort: () => void = () => {};
    const aborted = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(controller.signal.reason);
      controller.signal.addEventListener("abort", onAbort, { once: true });
    });
    try {
      const response = await Promise.race([fetchImpl(`${origin}${path}`, init), aborted]);
      status = response.status;
      void response.body?.cancel().catch(() => {});
      return response;
    } finally { controller.signal.removeEventListener("abort", onAbort); }
  };
  const uncached = (response: Response) => /(?:^|,)\s*no-store\s*(?:,|$)/i.test(response.headers.get("cache-control") ?? "");
  try {
    if (mode === "candidate") {
      for (const path of ["/", "/sign-in", "/api/session"]) {
        const response = await request(path);
        if ([401, 403].includes(response.status) || response.status >= 300 && response.status < 400) return result(null);
        if (response.status !== 421 || !uncached(response)) return result(false);
      }
      return result(true);
    }
    if (mode === "anonymous") {
      const home = await request("/", { redirect: "manual" });
      if (home.status !== 307 || home.headers.get("location") !== `${origin}/sign-in` || !uncached(home)) return result(false);
      for (const [path, expected] of [["/sign-in", 200], ["/api/session", 401], ["/api/recipes/search", 401]] as const) {
        const response = await request(path, { post: path === "/api/recipes/search" });
        if (response.status !== expected || !uncached(response)) return result(false);
      }
      return result(true);
    }
    if (mode === "disconnect") {
      await request("/api/recipes/search", { post: true });
      return result(null); // A fast response did not exercise cancellation.
    }
    for (let index = 0; index < 21; index++) {
      const response = await request("/api/recipes/search", { post: true });
      if (response.status === 429) return result(index === 20 ? true : null);
      if (response.status !== 401) return result(false);
    }
    return result(false);
  } catch {
    // Without a candidate response (including a refused platform login redirect),
    // there is no application result to judge. Never follow the redirect.
    const inconclusive = mode === "candidate" ||
      (controller.signal.aborted && (mode === "disconnect" || mode === "waf"));
    return result(inconclusive ? null : false);
  } finally { clearTimeout(timer); }
}

async function main() {
  const mode = process.argv[2];
  if (process.argv.length !== 3 || !modes.includes(mode)) throw new Error("Invalid mode");
  let sessionCookie: string | undefined;
  if ((mode === "disconnect" || mode === "candidate") && !process.stdin.isTTY) {
    let value = "";
    const timer = setTimeout(() => process.stdin.destroy(new Error("Input timed out")), 10000);
    try {
      for await (const chunk of process.stdin) {
        value += String(chunk);
        if (value.length > 16386) throw new Error("Input too large");
      }
      // One trailing line terminator is accepted; embedded newlines are rejected.
      sessionCookie = value.replace(/\r?\n$/, "") || undefined;
    } finally { clearTimeout(timer); }
  }
  const result = await runSmoke({ origin: process.env.MEAL_PLANNER_ORIGIN ?? "", mode: mode as Mode, sessionCookie });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = result.pass === true ? 0 : result.pass === null ? 2 : 1;
}

// The repository's pinned tsx loader runs this file as CommonJS.
if (typeof __filename !== "undefined" && process.argv[1] && resolve(process.argv[1]) === __filename) {
  void main().catch(() => {
    process.stderr.write("Smoke check could not run; verify mode, origin and private input.\n");
    process.exitCode = 1;
  });
}
