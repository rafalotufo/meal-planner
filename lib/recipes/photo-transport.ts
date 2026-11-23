import { Resolver } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent, request as httpsRequest, type RequestOptions } from "node:https";
import type { ClientRequest, IncomingMessage } from "node:http";
import { checkServerIdentity } from "node:tls";
import ipaddr from "ipaddr.js";
import { safeRecipeUrl } from "./validation";

export type PhotoFetchOptions = { signal: AbortSignal; deadlineAt: number };
type PhotoResolver = { resolve4(host: string): Promise<string[]>; resolve6(host: string): Promise<string[]>; cancel(): void };
type PhotoRequest = (options: RequestOptions & { autoSelectFamily: false }, callback: (response: IncomingMessage) => void) => ClientRequest;

export function isPublicPhotoAddress(address: string, family: 4 | 6): boolean {
  if (isIP(address) !== family || address.includes("%")) return false;
  const parsed = ipaddr.parse(address);
  return parsed.range() === "unicast" && (family === 4 || parsed.match(ipaddr.parseCIDR("2000::/3")));
}

function validHtmlResponse(response: IncomingMessage): boolean {
  if (response.statusCode !== 200 || Buffer.byteLength(response.rawHeaders.join("\r\n")) > 16384) return false;
  const type = response.headers["content-type"];
  const encoding = response.headers["content-encoding"];
  const length = response.headers["content-length"];
  if (typeof type !== "string" || (encoding !== undefined && (typeof encoding !== "string" || encoding.trim().toLowerCase() !== "identity"))) return false;
  const parts = type.toLowerCase().split(";").map((part) => part.trim());
  if (parts[0] !== "text/html") return false;
  const charsets = parts.slice(1).filter((part) => part.startsWith("charset"));
  if (charsets.length > 1 || charsets.some((part) => !/^charset\s*=\s*"?(utf-8|us-ascii)"?$/.test(part))) return false;
  return length === undefined || (typeof length === "string" && /^\d+$/.test(length) && Number(length) <= 1048576);
}

export function createSafeHtmlLoader({
  makeResolver = (timeout: number): PhotoResolver => new Resolver({ timeout, tries: 1 }),
  request = httpsRequest,
  now = Date.now,
}: { makeResolver?: (timeout: number) => PhotoResolver; request?: PhotoRequest; now?: () => number } = {}) {
  return async function loadHtml(source: string, { signal, deadlineAt }: PhotoFetchOptions): Promise<string | null> {
    const safe = safeRecipeUrl(source);
    if (!safe || signal.aborted) return null;
    const url = new URL(safe);
    const timeout = Math.min(3000, deadlineAt - now());
    if (timeout <= 0 || /\.(lan|home|home\.arpa|localdomain)$/.test(url.hostname)) return null;
    return new Promise((resolve) => {
      let settled = false;
      let resolver: PhotoResolver | undefined;
      let agent: Agent | undefined;
      let outgoing: ClientRequest | undefined;
      let incoming: IncomingMessage | undefined;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener("abort", abort);
        resolver?.cancel();
        outgoing?.destroy();
        incoming?.destroy();
        agent?.destroy();
        resolve(value);
      };
      const abort = () => finish(null);
      const timer = setTimeout(abort, timeout);
      signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) { finish(null); return; }
      void (async () => {
        resolver = makeResolver(Math.max(1, Math.min(1000, timeout)));
        const answers = await Promise.allSettled([resolver.resolve4(url.hostname), resolver.resolve6(url.hostname)]);
        if (settled) return;
        const addresses: { address: string; family: 4 | 6 }[] = [];
        for (let index = 0; index < answers.length; index++) {
          const answer = answers[index];
          if (answer.status === "rejected") {
            const code = (answer.reason as NodeJS.ErrnoException | undefined)?.code;
            if (code !== "ENODATA" && code !== "ENOTFOUND") { finish(null); return; }
            continue;
          }
          const family = index === 0 ? 4 : 6;
          for (const address of answer.value) {
            if (typeof address !== "string" || !isPublicPhotoAddress(address, family)) { finish(null); return; }
            addresses.push({ address, family });
          }
        }
        if (addresses.length === 0 || addresses.length > 16) { finish(null); return; }
        const pinned = addresses[0];
        // Dedicated native transport: never reuse a global/proxy agent or resolve the hostname again.
        // https://nodejs.org/api/https.html#httpsrequestoptions-callback
        agent = new Agent({ keepAlive: false, maxSockets: 1, maxFreeSockets: 0, maxCachedSessions: 0,
          proxyEnv: { NODE_ENV: "production" } });
        outgoing = request({ protocol: "https:", hostname: url.hostname, port: 443,
          path: url.pathname + url.search, method: "GET", servername: url.hostname,
          rejectUnauthorized: true, checkServerIdentity, agent, family: pinned.family,
          autoSelectFamily: false, maxHeaderSize: 16384, signal,
          lookup: (hostname, options, callback) => {
            const family = options.family;
            if (hostname !== url.hostname || (family && family !== pinned.family && family !== (pinned.family === 4 ? "IPv4" : "IPv6"))) {
              callback(Object.assign(new Error("Metadata address unavailable"), { code: "ENOTFOUND" }), ""); return;
            }
            if (options.all) callback(null, [pinned]);
            else callback(null, pinned.address, pinned.family);
          },
          headers: { Host: url.hostname, Accept: "text/html", "Accept-Encoding": "identity",
            "User-Agent": "MealPlanner-RecipePhotos/1.0", Connection: "close" },
        }, (response) => {
          incoming = response;
          if (settled) { response.destroy(); return; }
          if (!validHtmlResponse(response)) { finish(null); return; }
          let size = 0;
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > 1048576) { finish(null); return; }
            chunks.push(chunk);
          });
          response.on("error", () => finish(null));
          response.on("aborted", () => finish(null));
          response.on("close", () => { if (!settled) finish(null); });
          response.on("end", () => {
            try { finish(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))); }
            catch { finish(null); }
          });
        });
        outgoing.on("error", () => finish(null));
        if (settled) outgoing.destroy();
        else outgoing.end();
      })().catch(() => finish(null));
    });
  };
}
