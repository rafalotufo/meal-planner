export function validateQuery(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const query = value.trim();
  return query.length > 0 && query.length <= 1000 ? query : null;
}

export function safeRecipeUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048 || /[\x00-\x20\x7f]/.test(value)) {
    return null;
  }
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
      !host.includes(".") || /^[\d.]+$/.test(host) || host.includes(":") ||
      host === "localhost" || /\.(local|localhost|internal)$/.test(host)) {
      return null;
    }
    url.hostname = host;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function boundedText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}
