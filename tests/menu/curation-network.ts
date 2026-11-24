// Explicit test-process preload only. Production never imports this module.
import assert from 'node:assert/strict';
import https, { type RequestOptions } from 'node:https';
import { request as httpRequest, type IncomingMessage } from 'node:http';
import { Resolver } from 'node:dns/promises';
import { syncBuiltinESMExports } from 'node:module';
import { checkServerIdentity } from 'node:tls';

const fixture = new URL(process.env.CURATION_FIXTURE_ORIGIN ?? '');
assert.equal(fixture.protocol, 'http:'); assert.equal(fixture.hostname, '127.0.0.1');
assert.ok(/^\d+$/.test(fixture.port)); assert.equal(fixture.pathname, '/');
const hostname = 'recipes.example.test';
Object.defineProperty(Resolver.prototype, 'resolve4', { value: async (host: string) => {
  assert.ok([hostname, 'private-recipes.example.test', 'mixed-recipes.example.test'].includes(host), 'unexpected native recipe DNS lookup');
  return host === 'private-recipes.example.test' ? ['127.0.0.1'] : host === 'mixed-recipes.example.test' ? ['93.184.216.34', '127.0.0.1'] : ['93.184.216.34'];
} });
Object.defineProperty(Resolver.prototype, 'resolve6', { value: async (host: string) => {
  assert.ok([hostname, 'private-recipes.example.test', 'mixed-recipes.example.test'].includes(host), 'unexpected native recipe DNS lookup'); return [];
} });
Object.defineProperty(https, 'request', { value: (options: RequestOptions & { autoSelectFamily: false }, callback: (response: IncomingMessage) => void) => {
  assert.equal(options.hostname, hostname, 'unexpected native HTTPS request');
  assert.equal(options.protocol, 'https:'); assert.equal(options.port, 443);
  assert.equal(options.method, 'GET'); assert.equal(options.servername, hostname);
  assert.equal(options.rejectUnauthorized, true); assert.equal(options.checkServerIdentity, checkServerIdentity);
  assert.equal(options.autoSelectFamily, false); assert.equal(options.family, 4);
  assert.equal(options.maxHeaderSize, 16384); assert.ok(options.agent instanceof https.Agent);
  assert.ok(options.signal); assert.ok(options.lookup);
  options.lookup(hostname, { family: 4, all: false }, (error, address, family) => {
    assert.equal(error, null); assert.equal(address, '93.184.216.34'); assert.equal(family, 4);
  });
  assert.ok(options.headers && !Array.isArray(options.headers));
  const headers = Object.fromEntries(Object.entries(options.headers));
  assert.equal(headers.Host, hostname); assert.equal(headers['Accept-Encoding'], 'identity');
  assert.equal(headers.Authorization, undefined); assert.equal(headers.Cookie, undefined);
  // Only this test preload remaps the approved native transport to owned loopback.
  // Real HTTP streams exercise parser/body/lifecycle while production DNS/TLS stays unchanged.
  return httpRequest({ hostname: fixture.hostname, port: fixture.port, path: options.path, method: 'GET', headers: { Host: hostname }, signal: options.signal, agent: false }, callback);
} });
syncBuiltinESMExports();
