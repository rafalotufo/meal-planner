import assert from "node:assert/strict";
import { test } from "node:test";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { checkStaging, finalizeStaging } from "./staging.ts";

const now = Date.now();
const expected = {
  version: 1, runId: "staging-test", origin: "https://meal-planner-staging-example.vercel.app",
  sourceSha: "a".repeat(40), deploymentId: "dpl_candidate", teamId: "team_2c0O29FMb91g7L6sUChc9v6J",
  projectId: "prj_ntxXnJAVA977jHjLNDR7xJuwSx4V", productionDeploymentId: "dpl_current",
  productionOrigins: ["https://meal-planner-production-example.vercel.app"],
};
const pre = {
  ...expected, capturedAt: new Date(now - 1000).toISOString(), environment: "preview", ready: true,
  generatedOrigins: ["https://meal-planner-generated-example.vercel.app"], aliasesComplete: true,
  domainsComplete: true, aliasIsProduction: false, previewConfigurationVerified: true, providerKeyAbsent: true,
};
const attestations = {
  version: 1, runId: expected.runId, capturedAt: new Date(now).toISOString(), googleAllowed: true,
  googleDenied: true, browser390: true, browser1440: true, keyboard: true,
  signOutAndFreshSignIn: true, stagingSessionProvenance: true,
};
const noStore = { "cache-control": "private, no-store" };
type Fetcher = (url: string, init: RequestInit) => Promise<Response>;
const healthy: Fetcher = async (url, init) => {
  const member = new Headers(init.headers).has("cookie");
  const path = new URL(url).pathname;
  if (path === "/" && !member) return new Response(null, { status: 307, headers: { ...noStore, location: `${expected.origin}/sign-in` } });
  if (path === "/" || path === "/sign-in") return new Response("<h1>Meal Planner</h1>Continue with Google", { headers: { ...noStore, "content-type": "text/html" } });
  if (!member) return Response.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
  if (path === "/api/session") return Response.json({ authenticated: true }, { headers: noStore });
  if (path === "/api/family") return Response.json({ members: [{ id: "member", email: "private@example.test" }], invitations: [] }, { headers: noStore });
  return Response.json({ error: { code: "SEARCH_UNAVAILABLE" } }, { status: 503, headers: noStore });
};
const options = () => ({ expected, pre, now: () => now, fetchImpl: healthy });

test("wrong targets and malformed metadata fail before secret input or network", async () => {
  const mutations = [
    { expected: { ...expected, origin: expected.productionOrigins[0] } },
    { expected: { ...expected, origin: `${expected.origin}/path` } },
    { expected: { ...expected, origin: "https://nested.bad.vercel.app" } },
    { expected: { ...expected, deploymentId: expected.productionDeploymentId } },
    { expected: { ...expected, projectId: "prj_wrong" } },
    { pre: { ...pre, sourceSha: "b".repeat(40) } },
    { pre: { ...pre, origin: pre.generatedOrigins[0] } },
    { pre: { ...pre, environment: "production" } },
    { pre: { ...pre, unexpected: "must not log" } },
  ];
  for (const mutation of mutations) {
    let effects = 0;
    const result = await checkStaging({ ...options(), ...mutation, readPrivate: async () => { effects++; return {}; }, fetchImpl: async () => { effects++; throw Error("secret"); } });
    assert.equal(result.exitCode, 1);
    assert.equal(effects, 0);
    assert.doesNotMatch(JSON.stringify(result), /must not log/);
  }
});

test("stale, future, incomplete or unsafe inspections are inconclusive without effects", async () => {
  for (const change of [
    { capturedAt: new Date(now - 300001).toISOString() }, { capturedAt: new Date(now + 1).toISOString() },
    { aliasesComplete: false }, { domainsComplete: false }, { aliasIsProduction: true },
    { previewConfigurationVerified: false }, { providerKeyAbsent: false }, { ready: false },
  ]) {
    let effects = 0;
    const result = await checkStaging({ ...options(), pre: { ...pre, ...change }, readPrivate: async () => { effects++; return {}; } });
    assert.equal(result.exitCode, 2);
    assert.equal(effects, 0);
  }
});

test("anonymous checks never send the supplied member cookie and cannot certify full validation", async () => {
  const requests: string[] = [];
  const report = await checkStaging({ ...options(), readPrivate: async () => ({ sessionCookie: "secret-session", protectionBypass: "secret-platform" }), fetchImpl: async (url, init) => {
    requests.push(url);
    assert.equal(new Headers(init.headers).has("cookie"), false);
    assert.equal(new Headers(init.headers).get("x-vercel-protection-bypass"), "secret-platform");
    assert.equal(init.redirect, "manual");
    assert.equal(new URL(url).origin, expected.origin);
    return healthy(url, init);
  } });
  assert.equal(report.pass, null);
  assert.equal(report.reason, "POSTCHECK_REQUIRED");
  assert.equal(requests.length, 4);
  const result = finalizeStaging({ expected, pre, report, post: { ...pre, capturedAt: new Date(now).toISOString() }, attestations, now });
  assert.equal(result.exitCode, 2);
  assert.doesNotMatch(JSON.stringify(report), /secret-session|secret-platform/);
});

test("member reads and fresh post inspection plus owner evidence allow a full pass", async () => {
  const report = await checkStaging({ ...options(), mode: "member", readPrivate: async () => ({ sessionCookie: "session=private" }) });
  assert.equal(report.reason, "POSTCHECK_REQUIRED");
  assert.equal(report.checks.length, 7);
  const result = finalizeStaging({ expected, pre, report, post: { ...pre, capturedAt: new Date(now).toISOString() }, attestations, now });
  assert.equal(result.pass, true);
  assert.equal(result.exitCode, 0);
  assert.doesNotMatch(JSON.stringify(result), /private@example|session=private|members/);
});

test("only explicit missing-provider mode sends a valid member search", async () => {
  let posts = 0;
  const report = await checkStaging({ ...options(), mode: "missing-provider", readPrivate: async () => ({ sessionCookie: "session=private" }), fetchImpl: async (url, init) => {
    if (init.method === "POST" && new Headers(init.headers).has("cookie")) {
      posts++;
      assert.deepEqual(JSON.parse(String(init.body)), { query: "potato gnocchi" });
    }
    return healthy(url, init);
  } });
  assert.equal(posts, 1);
  assert.equal(report.checks.length, 8);
  assert.equal(report.reason, "POSTCHECK_REQUIRED");
});

test("redirects and platform challenges never forward credentials or retry", async () => {
  for (const response of [new Response(null, { status: 302, headers: { location: "https://accounts.google.com/secret" } }), new Response("private", { status: 403, headers: { "x-vercel-mitigated": "challenge" } })]) {
    let calls = 0;
    const result = await checkStaging({ ...options(), readPrivate: async () => ({ protectionBypass: "private" }), fetchImpl: async () => { calls++; return response; } });
    assert.equal(calls, 1);
    assert.equal(result.exitCode, 2);
    assert.doesNotMatch(JSON.stringify(result), /accounts.google|private/);
  }
});

test("unprovisioned or expired sessions remain inconclusive", async () => {
  const report = await checkStaging({ ...options(), mode: "member", readPrivate: async () => ({ sessionCookie: "session=expired" }), fetchImpl: async (url, init) => new Headers(init.headers).has("cookie") ? Response.json({ error: "Unauthorized" }, { status: 401, headers: noStore }) : healthy(url, init) });
  assert.equal(report.exitCode, 2);
  assert.equal(report.reason, "SESSION_UNAVAILABLE");
});

test("private input rejects unknown fields, controls and oversized values without network", async () => {
  for (const secret of [{ productionCookie: "private" }, { sessionCookie: "private\r\nheader" }, { sessionCookie: "x".repeat(16385) }, { protectionBypass: "x".repeat(4097) }]) {
    let calls = 0;
    const report = await checkStaging({ ...options(), readPrivate: async () => secret, fetchImpl: async () => { calls++; throw Error(); } });
    assert.equal(report.exitCode, 1);
    assert.equal(calls, 0);
    assert.doesNotMatch(JSON.stringify(report), /private/);
  }
});

test("oversized and malformed bodies are bounded and never retained", async () => {
  for (const body of ["x".repeat(1024 * 1024 + 1), "not-json-private"]) {
    const report = await checkStaging({ ...options(), mode: "member", readPrivate: async () => ({ sessionCookie: "session=x" }), fetchImpl: async (url, init) => {
      if (url.endsWith("/sign-in")) return new Response(body, { headers: { ...noStore, "content-type": "text/html" } });
      return healthy(url, init);
    } });
    assert.notEqual(report.exitCode, 0);
    assert.doesNotMatch(JSON.stringify(report), /not-json-private/);
  }
});

test("request and body stalls that ignore AbortSignal still reach the deadline", async () => {
  for (const fetchImpl of [async () => new Promise<Response>(() => {}), async (url: string, init: RequestInit) => url.endsWith("/sign-in") ? new Response(new ReadableStream<Uint8Array>({ start() {} }), { headers: { ...noStore, "content-type": "text/html" } }) : healthy(url, init)]) {
    const started = Date.now();
    const report = await checkStaging({ ...options(), requestTimeoutMs: 20, runTimeoutMs: 60, fetchImpl });
    assert.equal(report.exitCode, 2);
    assert.ok(Date.now() - started < 1000);
  }
});

test("finalization rejects premature/stale evidence, target drift and missing owner evidence", async () => {
  const report = await checkStaging({ ...options(), mode: "member", readPrivate: async () => ({ sessionCookie: "session=x" }) });
  const post = { ...pre, capturedAt: new Date(now).toISOString() };
  for (const mutation of [
    { post: pre }, { post: { ...post, deploymentId: "dpl_changed" } },
    { post: { ...post, productionDeploymentId: "dpl_changed" } },
    { post: { ...post, productionOrigins: [...post.productionOrigins, "https://another.vercel.app"] } },
    { attestations: { ...attestations, googleAllowed: false } },
    { attestations: { ...attestations, browser1440: false } },
    { attestations: { ...attestations, runId: "another-run" } },
  ]) {
    const result = finalizeStaging({ expected, pre, report, post, attestations, now, ...mutation });
    assert.notEqual(result.exitCode, 0);
  }
  assert.equal(finalizeStaging({ expected, pre, report, post, attestations, now: now + 300001 }).exitCode, 2);
});

test("finalization rejects mistyped owner assertions and contradictory public check statuses", async () => {
  const report = await checkStaging({ ...options(), mode: "member", readPrivate: async () => ({ sessionCookie: "session=x" }) });
  const base = { expected, pre, report, post: { ...pre, capturedAt: new Date(now).toISOString() }, attestations, now };
  assert.equal(finalizeStaging({ ...base, attestations: { ...attestations, googleAllowed: "true" } }).exitCode, 1);
  assert.equal(finalizeStaging({ ...base, report: { ...report, checks: report.checks.map((check, index) => index === 0 ? { ...check, status: 418 } : check) } }).exitCode, 1);
});

test("actual CLI rejects wrong target before waiting for private stdin and preserves foreign lock", async () => {
  const directory = await mkdtemp(join(tmpdir(), "staging-cli-"));
  try {
    const expectedFile = join(directory, "expected.json");
    const preFile = join(directory, "pre.json");
    await writeFile(expectedFile, JSON.stringify({ ...expected, origin: expected.productionOrigins[0] }));
    await writeFile(preFile, JSON.stringify(pre));
    const invoke = async () => new Promise<{ code: number | null; text: string }>((resolveResult, reject) => {
      const child = spawn(process.execPath, ["--import", resolve("node_modules/tsx/dist/loader.mjs"), resolve("tests/deployment/staging.ts"), "check", expectedFile, preFile], { cwd: directory, stdio: ["pipe", "pipe", "pipe"] });
      let output = "";
      child.stdout.on("data", (chunk) => { output += String(chunk); });
      child.stderr.on("data", (chunk) => { output += String(chunk); });
      const timer = setTimeout(() => { child.kill(); reject(Error("CLI waited for stdin")); }, 5000);
      child.once("close", (code) => { clearTimeout(timer); resolveResult({ code, text: output }); });
      child.once("error", reject);
    });
    const result = await invoke();
    assert.equal(result.code, 1);
    assert.doesNotMatch(result.text, /session|cookie|private@example/);
    await mkdir(join(directory, ".data", "staging-validation-process.lock"), { recursive: true, mode: 0o700 });
    assert.equal((await invoke()).code, 2);
    await access(join(directory, ".data", "staging-validation-process.lock"));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
