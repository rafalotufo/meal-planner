import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type { ClientRequest, IncomingHttpHeaders, IncomingMessage } from "node:http";
import type { RequestOptions } from "node:https";
import type { Recipe } from "../lib/recipes/types.js";

export const photoRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  title: "Potato Gnocchi", sourceUrl: "https://recipes.example.com/gnocchi", imageUrl: null,
  summary: "Shape the dough, boil the gnocchi and serve.", time: { kind: "cook", text: "20 minutes" }, ...overrides,
});
export const jsonLd = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;

export function networkFixture({ a = ["8.8.8.8"], aaaa = ["2001:4860:4860::8888"],
  status = 200, headers = { "content-type": "text/html; charset=utf-8" }, body = "<html></html>",
  slow = false, dnsError, requestError }: {
  a?: string[]; aaaa?: string[]; status?: number; headers?: IncomingHttpHeaders;
  body?: string | Uint8Array; slow?: boolean; dnsError?: string; requestError?: string;
} = {}) {
  const options: (RequestOptions & { autoSelectFamily?: boolean })[] = [];
  let canceled = 0;
  let destroyed = 0;
  let lookups = 0;
  const resolver = { resolve4: async () => { lookups++; if (dnsError) throw Object.assign(new Error(), { code: dnsError }); return a; },
    resolve6: async () => { lookups++; return aaaa; }, cancel: () => { canceled++; } };
  const stream = new PassThrough();
  const response = Object.assign(stream, { statusCode: status, headers,
    rawHeaders: Object.entries(headers).flatMap(([name, value]) => [name, String(value)]) }) as unknown as IncomingMessage;
  const request = (input: RequestOptions, callback: (response: IncomingMessage) => void) => {
    options.push(input);
    const req = new EventEmitter() as ClientRequest;
    req.destroy = () => { destroyed++; response.destroy(); return req; };
    req.end = () => {
      queueMicrotask(() => {
        if (requestError) req.emit("error", Object.assign(new Error(), { code: requestError }));
        else { callback(response); if (!slow) stream.end(body); }
      });
      return req;
    };
    return req;
  };
  return { resolver, request, response, options, counts: () => ({ canceled, destroyed, lookups }) };
}
