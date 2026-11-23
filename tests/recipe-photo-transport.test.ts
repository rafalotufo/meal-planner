import assert from "node:assert/strict";
import test from "node:test";
import { checkServerIdentity } from "node:tls";
import { setTimeout as delay } from "node:timers/promises";
import { createSafeHtmlLoader, isPublicPhotoAddress } from "../lib/recipes/photo-transport.js";
import { networkFixture } from "./recipe-photo-fixtures.js";

const source = "https://recipes.example.com/gnocchi?version=1";
const budget = () => ({ signal: new AbortController().signal, deadlineAt: Date.now() + 3000 });

test("address policy accepts only canonical public A/AAAA and rejects special/mapped/transition ranges", () => {
  assert.equal(isPublicPhotoAddress("8.8.8.8", 4), true);
  assert.equal(isPublicPhotoAddress("2001:4860:4860::8888", 6), true);
  for (const address of ["127.0.0.1", "10.0.0.1", "100.64.0.1", "169.254.169.254", "192.0.2.1",
    "0.0.0.0", "224.0.0.1", "8.8.2056", "invalid", "::1", "fc00::1", "fe80::1", "2001:db8::1",
    "3fff::1", "2002:808:808::1", "2001::1", "::ffff:8.8.8.8", "64:ff9b::808:808"]) {
    assert.equal(isPublicPhotoAddress(address, address.includes(":") ? 6 : 4), false, address);
  }
  assert.equal(isPublicPhotoAddress("8.8.8.8", 6), false);
});

test("native transport pins one validated address with original TLS/Host and fixed credential-free options", async () => {
  const fixture = networkFixture();
  const load = createSafeHtmlLoader({ makeResolver: () => fixture.resolver, request: fixture.request });
  assert.equal(await load(source, budget()), "<html></html>");
  const options = fixture.options[0];
  assert.equal(options.hostname, "recipes.example.com");
  assert.equal(options.servername, "recipes.example.com");
  assert.equal(options.rejectUnauthorized, true);
  assert.equal(options.checkServerIdentity, checkServerIdentity);
  assert.equal(options.port, 443);
  assert.equal(options.path, "/gnocchi?version=1");
  assert.equal(options.maxHeaderSize, 16384);
  assert.equal(options.autoSelectFamily, false);
  assert.deepEqual(options.headers, { Host: "recipes.example.com", Accept: "text/html", "Accept-Encoding": "identity",
    "User-Agent": "MealPlanner-RecipePhotos/1.0", Connection: "close" });
  assert.equal(options.ca, undefined);
  assert.equal(options.socketPath, undefined);
  fixture.resolver.resolve4 = async () => ["127.0.0.1"];
  options.lookup!("recipes.example.com", {}, (error, address, family) => {
    assert.equal(error, null); assert.equal(address, "8.8.8.8"); assert.equal(family, 4);
  });
  options.lookup!("recipes.example.com", { all: true }, (error, addresses) => {
    assert.equal(error, null); assert.deepEqual(addresses, [{ address: "8.8.8.8", family: 4 }]);
  });
  assert.equal(fixture.counts().lookups, 2);
  assert.equal(fixture.counts().canceled, 1);
  assert.equal(fixture.counts().destroyed, 1);
});

test("mixed private/public DNS, errors, excessive answers and unsafe sources never connect", async () => {
  for (const fixture of [networkFixture({ a: ["8.8.8.8", "10.0.0.1"] }),
    networkFixture({ aaaa: ["::ffff:8.8.8.8"] }), networkFixture({ a: Array(17).fill("8.8.8.8") }),
    networkFixture({ a: [], aaaa: [] }), networkFixture({ dnsError: "ETIMEOUT" })]) {
    assert.equal(await createSafeHtmlLoader({ makeResolver: () => fixture.resolver, request: fixture.request })(source, budget()), null);
    assert.equal(fixture.options.length, 0);
    assert.equal(fixture.counts().canceled, 1);
  }
  const fixture = networkFixture();
  const load = createSafeHtmlLoader({ makeResolver: () => fixture.resolver, request: fixture.request });
  for (const url of ["http://recipes.example.com/a", "https://127.0.0.1/a", "https://localhost/a", "https://a.local/a",
    "https://user:pass@recipes.example.com/a", "https://recipes.example.com:444/a"]) assert.equal(await load(url, budget()), null);
  assert.equal(fixture.counts().lookups, 0);
});

test("missing DNS family may coexist with public other family but other DNS errors cannot", async () => {
  const fixture = networkFixture({ dnsError: "ENODATA" });
  assert.equal(await createSafeHtmlLoader({ makeResolver: () => fixture.resolver, request: fixture.request })(source, budget()), "<html></html>");
});

test("redirects, TLS failure, encoding/type/size violations fail softly and destroy resources", async () => {
  for (const fixture of [networkFixture({ status: 301, headers: { location: "https://127.0.0.1/a" } }),
    networkFixture({ requestError: "ERR_TLS_CERT_ALTNAME_INVALID" }),
    networkFixture({ headers: { "content-type": "application/json" } }),
    networkFixture({ headers: { "content-type": "text/html; charset=iso-8859-1" } }),
    networkFixture({ headers: { "content-type": "text/html", "content-encoding": "gzip" } }),
    networkFixture({ headers: { "content-type": "text/html", "x-large": "x".repeat(17000) } }),
    networkFixture({ headers: { "content-type": "text/html", "content-length": "1" }, body: "x".repeat(1048577) }),
    networkFixture({ body: new Uint8Array([0xc3, 0x28]) })]) {
    assert.equal(await createSafeHtmlLoader({ makeResolver: () => fixture.resolver, request: fixture.request })(source, budget()), null);
    assert.equal(fixture.options.length, 1);
    assert.equal(fixture.counts().canceled, 1);
    assert.equal(fixture.counts().destroyed, 1);
  }
});

test("deadline and parent abort cancel stalled DNS/body without waiting or leaking native work", async () => {
  const slow = networkFixture({ slow: true });
  const load = createSafeHtmlLoader({ makeResolver: () => slow.resolver, request: slow.request });
  assert.equal(await load(source, { signal: new AbortController().signal, deadlineAt: Date.now() + 15 }), null);
  assert.equal(slow.counts().destroyed, 1);
  const dns = networkFixture();
  dns.resolver.resolve4 = () => new Promise<string[]>(() => {});
  const aborter = new AbortController();
  const pending = createSafeHtmlLoader({ makeResolver: () => dns.resolver, request: dns.request })(source,
    { signal: aborter.signal, deadlineAt: Date.now() + 3000 });
  await delay(1); aborter.abort();
  assert.equal(await pending, null);
  assert.equal(dns.counts().canceled, 1);
  assert.equal(dns.options.length, 0);
});
