import { createReadStream } from "node:fs";
import { mkdir, rmdir, lstat } from "node:fs/promises";
import { resolve, join } from "node:path";

type Mode = "anonymous" | "member" | "missing-provider";
type Reason = "INVALID_INPUT" | "INSPECTION_INCOMPLETE" | "INSPECTION_STALE" | "TARGET_DRIFT" | "PRIVATE_INPUT_REQUIRED" | "REQUEST_UNAVAILABLE" | "APP_ASSERTION" | "SESSION_UNAVAILABLE" | "POSTCHECK_REQUIRED" | "OWNER_EVIDENCE_REQUIRED" | "PASS" | "LOCKED";
type Expected = { version: 1; runId: string; origin: string; sourceSha: string; deploymentId: string; teamId: string; projectId: string; productionDeploymentId: string; productionOrigins: string[] };
type Inspection = Expected & { capturedAt: string; environment: string; ready: boolean; generatedOrigins: string[]; aliasesComplete: boolean; domainsComplete: boolean; aliasIsProduction: boolean; previewConfigurationVerified: boolean; providerKeyAbsent: boolean };
type Check = { name: string; status: number | null; elapsedMs: number; pass: boolean | null; reason: Reason };
type Report = { version: 1; phase: "check" | "final"; target: Expected | null; mode: Mode; startedAt: string; endedAt: string; checks: Check[]; pass: boolean | null; reason: Reason; exitCode: 0 | 1 | 2 };
type PrivateInput = { sessionCookie?: string; protectionBypass?: string };
type Fetcher = (url: string, init: RequestInit) => Promise<Response>;
type CheckOptions = { expected: unknown; pre: unknown; mode?: string; readPrivate?: () => Promise<unknown>; fetchImpl?: Fetcher; now?: () => number; requestTimeoutMs?: number; runTimeoutMs?: number };
const expectedKeys = ["version", "runId", "origin", "sourceSha", "deploymentId", "teamId", "projectId", "productionDeploymentId", "productionOrigins"];
const inspectionKeys = [...expectedKeys, "capturedAt", "environment", "ready", "generatedOrigins", "aliasesComplete", "domainsComplete", "aliasIsProduction", "previewConfigurationVerified", "providerKeyAbsent"];
const modes: readonly string[] = ["anonymous", "member", "missing-provider"];
const minute = 60000;

class CheckError extends Error {
  constructor(readonly reason: Reason, readonly exitCode: 1 | 2) { super(reason); }
}
function invalid(): never { throw new CheckError("INVALID_INPUT", 1); }
function object(value: unknown, keys: string[], optional: string[] = []): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !keys.includes(key)) || keys.some((key) => !optional.includes(key) && !Object.hasOwn(record, key))) invalid();
  return record;
}
function identifier(value: unknown, maximum = 128): string {
  if (typeof value !== "string" || value.length > maximum || !/^[A-Za-z0-9_-]+$/.test(value)) invalid();
  return value;
}
function origin(value: unknown): string {
  if (typeof value !== "string" || !/^https:\/\/[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/.test(value)) invalid();
  return value;
}
function origins(value: unknown, nonempty = true): string[] {
  if (!Array.isArray(value) || value.length > 100 || (nonempty && value.length === 0)) invalid();
  const result = value.map(origin).sort();
  if (new Set(result).size !== result.length) invalid();
  return result;
}
function timestamp(value: unknown): number {
  if (typeof value !== "string" || value.length !== 24 || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) invalid();
  return Date.parse(value);
}
function expectedTarget(input: unknown): Expected {
  const value = object(input, expectedKeys);
  if (value.version !== 1 || value.teamId !== "team_2c0O29FMb91g7L6sUChc9v6J" || value.projectId !== "prj_ntxXnJAVA977jHjLNDR7xJuwSx4V" || typeof value.sourceSha !== "string" || !/^[a-f0-9]{40}$/.test(value.sourceSha)) invalid();
  const result: Expected = { version: 1, runId: identifier(value.runId, 64), origin: origin(value.origin), sourceSha: value.sourceSha, deploymentId: identifier(value.deploymentId), teamId: value.teamId, projectId: value.projectId, productionDeploymentId: identifier(value.productionDeploymentId), productionOrigins: origins(value.productionOrigins) };
  if (result.productionOrigins.includes(result.origin) || result.productionDeploymentId === result.deploymentId) invalid();
  return result;
}
function sameTarget(left: Expected, right: Expected): boolean {
  return expectedKeys.every((key) => JSON.stringify(left[key as keyof Expected]) === JSON.stringify(right[key as keyof Expected]));
}
function inspect(input: unknown, expected: Expected, now: number, earliest?: number): Inspection {
  const value = object(input, inspectionKeys);
  const target = expectedTarget(Object.fromEntries(expectedKeys.map((key) => [key, value[key]])));
  if (!sameTarget(target, expected)) throw new CheckError("TARGET_DRIFT", 1);
  if (value.environment !== "preview") invalid();
  const captured = timestamp(value.capturedAt);
  for (const key of ["ready", "aliasesComplete", "domainsComplete", "aliasIsProduction", "previewConfigurationVerified", "providerKeyAbsent"]) if (typeof value[key] !== "boolean") invalid();
  if (captured > now || now - captured > 5 * minute || (earliest !== undefined && captured < earliest)) throw new CheckError("INSPECTION_STALE", 2);
  if (!value.ready || !value.aliasesComplete || !value.domainsComplete || value.aliasIsProduction || !value.previewConfigurationVerified || !value.providerKeyAbsent) throw new CheckError("INSPECTION_INCOMPLETE", 2);
  const generatedOrigins = origins(value.generatedOrigins);
  if (generatedOrigins.includes(expected.origin)) invalid();
  return { ...target, capturedAt: value.capturedAt as string, environment: "preview", ready: true, generatedOrigins, aliasesComplete: true, domainsComplete: true, aliasIsProduction: false, previewConfigurationVerified: true, providerKeyAbsent: true };
}
function privateInput(input: unknown): PrivateInput {
  const value = object(input, ["sessionCookie", "protectionBypass"], ["sessionCookie", "protectionBypass"]);
  for (const [key, limit] of [["sessionCookie", 16384], ["protectionBypass", 4096]] as const) {
    if (value[key] !== undefined && (typeof value[key] !== "string" || !value[key].length || Buffer.byteLength(value[key]) > limit || /[^\x20-\x7e]/.test(value[key]))) invalid();
  }
  return value as PrivateInput;
}
function duration(value: number | undefined, limit: number): number {
  if (value === undefined) return limit;
  if (!Number.isInteger(value) || value <= 0 || value > limit) invalid();
  return value;
}
async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw new CheckError("REQUEST_UNAVAILABLE", 2);
  let onAbort: () => void = () => {};
  const stopped = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(new CheckError("REQUEST_UNAVAILABLE", 2));
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try { return await Promise.race([promise, stopped]); }
  finally { signal.removeEventListener("abort", onAbort); }
}
async function bodyText(response: Response, maximum: number, signal: AbortSignal): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let result = "";
  try {
    for (;;) {
      const { done, value } = await abortable(reader.read(), signal);
      if (done) return result + decoder.decode();
      bytes += value.byteLength;
      if (bytes > maximum) throw new CheckError("REQUEST_UNAVAILABLE", 2);
      result += decoder.decode(value, { stream: true });
    }
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
type RequestCheck = { name: string; path: string; member: boolean; kind: "redirect" | "sign-in" | "home" | "unauthorized" | "session" | "family" | "provider"; post?: boolean };
function requests(mode: Mode): RequestCheck[] {
  const checks: RequestCheck[] = [
    { name: "anonymous-home", path: "/", member: false, kind: "redirect" },
    { name: "anonymous-sign-in", path: "/sign-in", member: false, kind: "sign-in" },
    { name: "anonymous-session", path: "/api/session", member: false, kind: "unauthorized" },
    { name: "anonymous-search", path: "/api/recipes/search", member: false, kind: "unauthorized", post: true },
  ];
  if (mode !== "anonymous") checks.push(
    { name: "member-home", path: "/", member: true, kind: "home" },
    { name: "member-session", path: "/api/session", member: true, kind: "session" },
    { name: "member-family", path: "/api/family", member: true, kind: "family" },
  );
  if (mode === "missing-provider") checks.push({ name: "missing-provider", path: "/api/recipes/search", member: true, kind: "provider", post: true });
  return checks;
}
function familyShape(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).sort().join() !== "invitations,members" || !Array.isArray(record.members) || !Array.isArray(record.invitations) || record.members.length === 0 || record.members.length > 1000 || record.invitations.length > 1000) return false;
  const text = (item: unknown, limit: number) => typeof item === "string" && item.length > 0 && item.length <= limit;
  return record.members.every((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const member = item as Record<string, unknown>;
    return Object.keys(member).sort().join() === "email,id" && text(member.id, 128) && text(member.email, 320);
  }) && record.invitations.every((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return false;
    const invitation = item as Record<string, unknown>;
    return Object.keys(invitation).sort().join() === "email,expiresAt,id,status" && text(invitation.id, 128) && text(invitation.email, 320) && Number.isFinite(invitation.expiresAt) && invitation.status === "pending";
  });
}
async function assertResponse(response: Response, check: RequestCheck, target: Expected, signal: AbortSignal) {
  if (response.headers.has("x-vercel-mitigated") || response.headers.has("x-vercel-error")) throw new CheckError("REQUEST_UNAVAILABLE", 2);
  if (check.member && [401, 403].includes(response.status)) throw new CheckError("SESSION_UNAVAILABLE", 2);
  if (response.status >= 300 && response.status < 400) {
    if (check.kind !== "redirect" || response.status !== 307 || response.headers.get("location") !== `${target.origin}/sign-in`) throw new CheckError("REQUEST_UNAVAILABLE", 2);
  } else if (check.kind === "redirect") throw new CheckError("REQUEST_UNAVAILABLE", 2);
  const cache = /(?:^|,)\s*no-store\s*(?:,|$)/i.test(response.headers.get("cache-control") ?? "");
  if (!cache) throw new CheckError("REQUEST_UNAVAILABLE", 2);
  if (check.kind === "redirect") return;
  const html = check.kind === "home" || check.kind === "sign-in";
  const contentType = response.headers.get("content-type")?.split(";")[0].trim();
  if (contentType !== (html ? "text/html" : "application/json")) throw new CheckError("REQUEST_UNAVAILABLE", 2);
  const text = await bodyText(response, html ? 1024 * 1024 : 65536, signal);
  let correct = false;
  if (html) correct = response.status === 200 && text.includes(check.kind === "home" ? "Meal Planner" : "Continue with Google");
  else {
    let value: unknown;
    try { value = JSON.parse(text); } catch { throw new CheckError("REQUEST_UNAVAILABLE", 2); }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new CheckError("APP_ASSERTION", 1);
    const data = value as Record<string, unknown>;
    if (check.kind === "unauthorized") correct = response.status === 401 && data.error === "Unauthorized";
    if (check.kind === "session") correct = response.status === 200 && data.authenticated === true && Object.keys(data).length === 1;
    if (check.kind === "family") correct = response.status === 200 && familyShape(value);
    if (check.kind === "provider") correct = response.status === 503 && !!data.error && typeof data.error === "object" && (data.error as Record<string, unknown>).code === "SEARCH_UNAVAILABLE";
  }
  if (!correct) throw new CheckError("APP_ASSERTION", 1);
}
function failure(error: unknown): CheckError { return error instanceof CheckError ? error : new CheckError("REQUEST_UNAVAILABLE", 2); }
function outcome(report: Report, reason: Reason, exitCode: 0 | 1 | 2): Report {
  return { ...report, pass: exitCode === 0 ? true : exitCode === 1 ? false : null, reason, exitCode };
}

// Operator-only: never imported by application code or uploaded to Vercel.
export async function checkStaging(options: CheckOptions): Promise<Report> {
  const now = options.now ?? Date.now;
  const start = now();
  let report: Report = { version: 1, phase: "check", target: null, mode: "anonymous", startedAt: new Date(start).toISOString(), endedAt: new Date(start).toISOString(), checks: [], pass: null, reason: "POSTCHECK_REQUIRED", exitCode: 2 };
  const run = new AbortController();
  let runTimer: ReturnType<typeof setTimeout> | undefined;
  try {
    const target = expectedTarget(options.expected);
    if (!modes.includes(options.mode ?? "anonymous")) invalid();
    report = { ...report, target, mode: (options.mode ?? "anonymous") as Mode };
    inspect(options.pre, target, start);
    const requestTimeout = duration(options.requestTimeoutMs, 10000);
    const runTimeout = duration(options.runTimeoutMs, minute);
    runTimer = setTimeout(() => run.abort(), runTimeout);
    const inputController = new AbortController();
    const inputTimer = setTimeout(() => inputController.abort(), 10000);
    let secrets: PrivateInput;
    try { secrets = privateInput(await abortable(options.readPrivate?.() ?? Promise.resolve({}), AbortSignal.any([run.signal, inputController.signal]))); }
    finally { clearTimeout(inputTimer); }
    if (report.mode !== "anonymous" && !secrets.sessionCookie) throw new CheckError("PRIVATE_INPUT_REQUIRED", 2);
    for (const check of requests(report.mode)) {
      const began = now();
      const requestController = new AbortController();
      const timer = setTimeout(() => requestController.abort(), requestTimeout);
      const signal = AbortSignal.any([run.signal, requestController.signal]);
      let response: Response | undefined;
      try {
        const headers = new Headers();
        if (secrets.protectionBypass) headers.set("x-vercel-protection-bypass", secrets.protectionBypass);
        if (check.member && secrets.sessionCookie) headers.set("cookie", secrets.sessionCookie);
        if (check.post) { headers.set("origin", target.origin); headers.set("content-type", "application/json"); }
        const init: RequestInit = { method: check.post ? "POST" : "GET", redirect: "manual", headers, signal };
        if (check.post) init.body = check.member ? JSON.stringify({ query: "potato gnocchi" }) : "{}";
        if (signal.aborted) throw new CheckError("REQUEST_UNAVAILABLE", 2);
        response = await abortable((options.fetchImpl ?? fetch)(`${target.origin}${check.path}`, init), signal);
        await assertResponse(response, check, target, signal);
        report.checks.push({ name: check.name, status: response.status, elapsedMs: Math.max(0, now() - began), pass: true, reason: "PASS" });
      } catch (error) {
        const failed = failure(error);
        report.checks.push({ name: check.name, status: response?.status ?? null, elapsedMs: Math.max(0, now() - began), pass: failed.exitCode === 1 ? false : null, reason: failed.reason });
        throw failed;
      } finally {
        clearTimeout(timer);
        if (response?.body && !response.body.locked) void response.body.cancel().catch(() => {});
      }
    }
    return report;
  } catch (error) {
    const failed = failure(error);
    return outcome(report, failed.reason, failed.exitCode);
  } finally {
    clearTimeout(runTimer);
    run.abort();
    report.endedAt = new Date(now()).toISOString();
  }
}

function checkedReport(input: unknown, target: Expected): Report {
  const value = object(input, ["version", "phase", "target", "mode", "startedAt", "endedAt", "checks", "pass", "reason", "exitCode"]);
  if (value.version !== 1 || value.phase !== "check" || typeof value.mode !== "string" || !modes.includes(value.mode) || !sameTarget(expectedTarget(value.target), target)) invalid();
  const start = timestamp(value.startedAt), end = timestamp(value.endedAt);
  if (end < start || end - start > minute || !Array.isArray(value.checks)) invalid();
  const required = requests(value.mode as Mode);
  if (value.checks.length !== required.length) throw new CheckError("OWNER_EVIDENCE_REQUIRED", 2);
  for (const [index, item] of value.checks.entries()) {
    const check = object(item, ["name", "status", "elapsedMs", "pass", "reason"]);
    const kind = required[index].kind;
    const expectedStatus = kind === "redirect" ? 307 : kind === "unauthorized" ? 401 : kind === "provider" ? 503 : 200;
    if (check.name !== required[index].name || typeof check.elapsedMs !== "number" || !Number.isFinite(check.elapsedMs) || check.elapsedMs < 0 || check.elapsedMs > minute || !Number.isInteger(check.status) || Number(check.status) < 100 || Number(check.status) > 599 || check.pass !== true || check.reason !== "PASS") invalid();
    if (check.status !== expectedStatus) invalid();
  }
  if (value.pass !== null || value.reason !== "POSTCHECK_REQUIRED" || value.exitCode !== 2) invalid();
  return value as Report;
}
export function finalizeStaging(options: { expected: unknown; pre: unknown; report: unknown; post: unknown; attestations: unknown; now?: number }): Report {
  const now = options.now ?? Date.now();
  let report: Report = { version: 1, phase: "final", target: null, mode: "anonymous", startedAt: new Date(now).toISOString(), endedAt: new Date(now).toISOString(), checks: [], pass: null, reason: "OWNER_EVIDENCE_REQUIRED", exitCode: 2 };
  try {
    const target = expectedTarget(options.expected);
    const checked = checkedReport(options.report, target);
    report = { ...checked, phase: "final" };
    const start = timestamp(checked.startedAt), end = timestamp(checked.endedAt);
    if (end > now) invalid();
    const before = inspect(options.pre, target, start);
    const after = inspect(options.post, target, now, end);
    if (JSON.stringify(before.generatedOrigins) !== JSON.stringify(after.generatedOrigins)) throw new CheckError("TARGET_DRIFT", 1);
    const keys = ["version", "runId", "capturedAt", "googleAllowed", "googleDenied", "browser390", "browser1440", "keyboard", "signOutAndFreshSignIn", "stagingSessionProvenance"];
    const attested = object(options.attestations, keys);
    if (attested.version !== 1 || attested.runId !== target.runId || timestamp(attested.capturedAt) > now) invalid();
    if (keys.slice(3).some((key) => typeof attested[key] !== "boolean")) invalid();
    if (timestamp(attested.capturedAt) < timestamp(before.capturedAt) || checked.mode === "anonymous" || keys.slice(3).some((key) => attested[key] !== true)) throw new CheckError("OWNER_EVIDENCE_REQUIRED", 2);
    return outcome(report, "PASS", 0);
  } catch (error) {
    const failed = failure(error);
    return outcome(report, failed.reason, failed.exitCode);
  }
}

async function readBounded(stream: AsyncIterable<Buffer | string>, maximum: number): Promise<string> {
  let bytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > maximum) invalid();
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}
async function publicFile(path: string): Promise<unknown> {
  return JSON.parse(await readBounded(createReadStream(path), 65536));
}
async function readPrivate(): Promise<unknown> {
  if (process.stdin.isTTY) return {};
  const timer = setTimeout(() => process.stdin.destroy(new Error("PRIVATE_INPUT_REQUIRED")), 10000);
  try {
    const text = await readBounded(process.stdin, 24576);
    try { return text.trim() ? JSON.parse(text) : {}; } catch { invalid(); }
  } finally { clearTimeout(timer); }
}
async function main() {
  const args = process.argv.slice(2);
  const data = resolve(".data");
  await mkdir(data, { recursive: true, mode: 0o700 });
  const stat = await lstat(data);
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0) invalid();
  const lock = join(data, "staging-validation-process.lock");
  try { await mkdir(lock, { mode: 0o700 }); }
  catch { throw new CheckError("LOCKED", 2); }
  try {
    let result: Report;
    if (args[0] === "check" && (args.length === 3 || args.length === 4)) {
      result = await checkStaging({ expected: await publicFile(args[1]), pre: await publicFile(args[2]), mode: args[3], readPrivate });
    } else if (args[0] === "finalize" && args.length === 6) {
      result = finalizeStaging({ expected: await publicFile(args[1]), pre: await publicFile(args[2]), report: await publicFile(args[3]), post: await publicFile(args[4]), attestations: await publicFile(args[5]) });
    } else invalid();
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = result.exitCode;
  } finally { await rmdir(lock); }
}
if (typeof __filename !== "undefined" && process.argv[1] && resolve(process.argv[1]) === __filename) {
  void main().catch((error: unknown) => {
    const failed = error instanceof CheckError ? error : new CheckError("INVALID_INPUT", 1);
    process.stderr.write(`${failed.reason}\n`);
    process.exitCode = failed.exitCode;
  });
}
