import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { runSmoke } from "./smoke.ts";

const origin = "https://meal-planner-example.vercel.app";
const noStore = { "cache-control": "no-store" };

test("invalid deployment targets are rejected before any request", async () => {
  for (const target of ["http://meal.vercel.app", "https://vercel.app", "https://evil.example", "https://a.vercel.app.evil.example", "https://user:secret@a.vercel.app", "https://a.vercel.app:443", "https://a.vercel.app/path", "https://a.vercel.app?query=1", "https://a.vercel.app#part", "https://127.0.0.1", "https://a..vercel.app"]) {
    let calls = 0;
    await assert.rejects(runSmoke({ origin: target, mode: "candidate", fetchImpl: async () => { calls++; return new Response(); } }));
    assert.equal(calls, 0, target);
  }
});

test("candidate requires no-store 421 responses, not platform protection denial", async () => {
  let calls = 0;
  const result = await runSmoke({ origin, mode: "candidate", fetchImpl: async (_url, init) => {
    calls++;
    assert.equal(init.redirect, "error");
    assert.equal(new Headers(init.headers).has("host"), false);
    return new Response(null, { status: 421, headers: noStore });
  } });
  assert.equal(result.pass, true);
  assert.equal(calls, 3);
  for (const status of [401, 403]) {
    assert.equal((await runSmoke({ origin, mode: "candidate", fetchImpl: async () => new Response(null, { status }) })).pass, null);
  }
  assert.equal((await runSmoke({ origin, mode: "candidate", fetchImpl: async () => new Response(null, { status: 421 }) })).pass, false);
});

test("candidate protection cookie stays on exact target and out of output", async () => {
  const result = await runSmoke({ origin, mode: "candidate", sessionCookie: "protection=private", fetchImpl: async (url, init) => {
    assert.equal(new URL(url).origin, origin);
    assert.equal(new Headers(init.headers).get("cookie"), "protection=private");
    return new Response(null, { status: 421, headers: noStore });
  } });
  assert.doesNotMatch(JSON.stringify(result), /private|protection/);
});

test("anonymous checks inspect exact redirect and never send authentication", async () => {
  const seen: string[] = [];
  const result = await runSmoke({ origin, mode: "anonymous", fetchImpl: async (url, init) => {
    const path = new URL(url).pathname;
    seen.push(path);
    assert.equal(new Headers(init.headers).has("cookie"), false);
    if (path === "/") {
      assert.equal(init.redirect, "manual");
      return new Response(null, { status: 307, headers: { ...noStore, location: `${origin}/sign-in` } });
    }
    if (path === "/sign-in") return new Response(null, { headers: noStore });
    if (path === "/api/recipes/search") {
      assert.equal(init.method, "POST");
      assert.equal(new Headers(init.headers).get("origin"), origin);
      assert.equal(init.body, "{}");
    }
    return new Response(null, { status: 401, headers: noStore });
  } });
  assert.equal(result.pass, true);
  assert.deepEqual(seen, ["/", "/sign-in", "/api/session", "/api/recipes/search"]);
});

test("unexpected destinations and status/cache errors fail closed", async () => {
  for (const location of ["https://evil.example/sign-in", `${origin}/other`, "//evil.example/sign-in", `${origin}/sign-in?next=other`]) {
    assert.equal((await runSmoke({ origin, mode: "anonymous", fetchImpl: async () => new Response(null, { status: 307, headers: { ...noStore, location } }) })).pass, false);
  }
  assert.equal((await runSmoke({ origin, mode: "candidate", fetchImpl: async () => new Response(null, { status: 302, headers: { location: "https://evil.example" } }) })).pass, null);
});

test("Vercel's relative redirect resolves to the exact expected sign-in URL", async () => {
  const result = await runSmoke({ origin, mode: "anonymous", fetchImpl: async (url) => {
    const path = new URL(url).pathname;
    if (path === "/") return new Response(null, { status: 307, headers: { ...noStore, location: "/sign-in" } });
    return new Response(null, { status: path === "/sign-in" ? 200 : 401, headers: noStore });
  } });
  assert.equal(result.pass, true);
});

test("no candidate application response is inconclusive and sanitized", async () => {
  const result = await runSmoke({ origin, mode: "candidate", fetchImpl: async () => { throw new Error("private cookie leaked by upstream"); } });
  assert.equal(result.pass, null);
  assert.doesNotMatch(JSON.stringify(result), /private|cookie|upstream/);
});

test("a quiet WAF window yields twenty anonymous denials then 429 with no provider query", async () => {
  let calls = 0;
  const result = await runSmoke({ origin, mode: "waf", fetchImpl: async (_url, init) => {
    calls++;
    assert.equal(new Headers(init.headers).has("cookie"), false);
    assert.equal(init.body, "{}");
    return new Response(null, { status: calls === 21 ? 429 : 401 });
  } });
  assert.equal(result.pass, true);
  assert.equal(calls, 21);
});

test("preexisting WAF traffic is inconclusive and unblocked bursts fail", async () => {
  assert.equal((await runSmoke({ origin, mode: "waf", fetchImpl: async () => new Response(null, { status: 429 }) })).pass, null);
  assert.equal((await runSmoke({ origin, mode: "waf", fetchImpl: async () => new Response(null, { status: 401 }) })).pass, false);
});

test("only candidate and disconnect accept bounded single-line cookies", async () => {
  for (const cookie of ["a=b\r\nHost: evil.example", "a=b\nc=d", "x".repeat(16385)]) {
    await assert.rejects(runSmoke({ origin, mode: "candidate", sessionCookie: cookie }));
  }
  await assert.rejects(runSmoke({ origin, mode: "anonymous", sessionCookie: "session=private" }));
  await assert.rejects(runSmoke({ origin, mode: "waf", sessionCookie: "session=private" }));
  await assert.rejects(runSmoke({ origin, mode: "disconnect" }));
});

test("fast disconnect response is inconclusive; one abort is not server cancellation proof", async () => {
  assert.equal((await runSmoke({ origin, mode: "disconnect", sessionCookie: "session=private", fetchImpl: async () => new Response() })).pass, null);
  let calls = 0;
  const started = Date.now();
  const result = await runSmoke({ origin, mode: "disconnect", sessionCookie: "session=private", fetchImpl: async (_url, init) => {
    calls++;
    assert.equal(init.body, JSON.stringify({ query: "potato gnocchi" }));
    return new Promise<Response>((_resolve, reject) => init.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true }));
  } });
  assert.equal(calls, 1);
  assert.equal(result.pass, null, "operator must correlate invocation evidence");
  assert.ok(Date.now() - started >= 1900 && Date.now() - started < 4000);
});

test("real HTTP candidate redirect is inconclusive without forwarding private cookie", async () => {
  let calls = 0;
  const server = createServer((_request, response) => { calls++; response.writeHead(302, { location: "http://127.0.0.1:1/secret" }).end(); });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    const result = await runSmoke({ origin, mode: "candidate", sessionCookie: "protection=private", fetchImpl: (url, init) => fetch(`http://127.0.0.1:${address.port}${new URL(url).pathname}`, init) });
    assert.equal(result.pass, null);
    assert.equal(calls, 1);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
