import { Parser } from "htmlparser2";
import { isRecord, safeRecipeUrl } from "./validation";

export type PhotoSelection = { imageUrl: string; width: number | null; height: number | null;
  reason: "recipe-sized" | "recipe-unknown" | "open-graph" | "recipe-small" };
type ImageCandidate = { imageUrl: string; width: number | null; height: number | null; order: number };
type OgImage = { url?: string; secure?: string; width?: string; height?: string };

function resolveUrl(value: unknown, source: string): string | null {
  if (typeof value !== "string" || /[\x00-\x1f\x7f]/.test(value) || !value.trim() || value.length > 2048) return null;
  try { return safeRecipeUrl(new URL(value.trim(), source).href); } catch { return null; }
}
function dimension(value: unknown): number | null {
  if (typeof value === "string" && /^\d+$/.test(value)) value = Number(value);
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= 20000 ? value : null;
}
function normalizedName(value: unknown): string | null {
  return typeof value === "string" ? value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim() : null;
}
function isRecipe(value: Record<string, unknown>): boolean {
  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  return types.some((type) => type === "Recipe" || type === "https://schema.org/Recipe" || type === "http://schema.org/Recipe");
}

export function selectRecipePhoto(html: string, recipe: { sourceUrl: string; title: string }): PhotoSelection | null {
  const source = safeRecipeUrl(recipe.sourceUrl);
  if (!source || Buffer.byteLength(html) > 1048576) return null;
  const documents: unknown[] = [];
  const identities: string[] = [];
  const ogImages: OgImage[] = [];
  let overflow = false;
  let script: string | null = null;
  let scriptBytes = 0;
  let totalScriptBytes = 0;
  let scripts = 0;
  let depth = 0;
  let headDepth = -1;
  let headValues = 0;
  const fail = () => { overflow = true; parser.pause(); };
  // Event callbacks collect only structured metadata; no DOM, script execution or secondary requests.
  const parser = new Parser({
    onopentag(name, attributes) {
      depth++;
      if (depth > 256) { fail(); return; }
      if (name === "head") headDepth = depth;
      if (name === "script" && attributes.type?.split(";")[0].trim().toLowerCase() === "application/ld+json") {
        if (++scripts > 16) { fail(); return; }
        script = ""; scriptBytes = 0;
      }
      if (headDepth < 0 || depth !== headDepth + 1) return;
      const property = attributes.property?.toLowerCase();
      if (name === "link" && attributes.rel?.toLowerCase().split(/\s+/).includes("canonical")) {
        if (++headValues > 128 || (attributes.href?.length ?? 0) > 2048) { fail(); return; }
        identities.push(attributes.href ?? "");
      } else if (name === "meta" && property && /^og:(url|image(?::(url|secure_url|width|height))?)$/.test(property)) {
        if (++headValues > 128 || (attributes.content?.length ?? 0) > 2048) { fail(); return; }
        const content = attributes.content ?? "";
        if (property === "og:url") identities.push(content);
        else if (property === "og:image" || property === "og:image:url") {
          if (ogImages.length >= 20) { fail(); return; }
          ogImages.push({ url: content });
        } else {
          const image = ogImages.at(-1);
          if (!image) return;
          if (property === "og:image:secure_url") image.secure = content;
          else if (property === "og:image:width") image.width = content;
          else if (property === "og:image:height") image.height = content;
        }
      }
    },
    ontext(text) {
      if (script === null) return;
      const bytes = Buffer.byteLength(text);
      scriptBytes += bytes; totalScriptBytes += bytes;
      if (scriptBytes > 131072 || totalScriptBytes > 262144) { fail(); return; }
      script += text;
    },
    onclosetag(name) {
      if (name === "script" && script !== null) {
        try { documents.push(JSON.parse(script)); } catch { /* Ignore one malformed structured-data script. */ }
        script = null;
      }
      if (name === "head") headDepth = -1;
      depth--;
    },
  }, { decodeEntities: true });
  try { parser.end(html); } catch { return null; }
  if (overflow) return null;

  let visited = 0;
  for (const document of documents) {
    const walk = [{ value: document, depth: 0 }];
    while (walk.length) {
      const entry = walk.pop()!;
      if (++visited > 1000 || entry.depth > 12) return null;
      if (entry.value !== null && typeof entry.value === "object") {
        for (const value of Object.values(entry.value)) walk.push({ value, depth: entry.depth + 1 });
      }
    }
  }
  const recipes: Record<string, unknown>[] = [];
  const roots = [...documents].reverse();
  while (roots.length) {
    const value = roots.pop();
    if (Array.isArray(value)) { roots.push(...[...value].reverse()); continue; }
    if (!isRecord(value)) continue;
    if (isRecipe(value)) recipes.push(value);
    if (Array.isArray(value["@graph"])) roots.push(...[...value["@graph"]].reverse());
  }
  const pageBound = identities.length > 0 && identities.every((identity) => resolveUrl(identity, source) === source);
  const associated = recipes.filter((node) => {
    const declared = [node.url, node["@id"], node.mainEntityOfPage].filter((value) => value !== undefined);
    const identities = declared.flatMap((value) => {
      if (!isRecord(value)) return [value];
      const links = [value["@id"], value.url].filter((link) => link !== undefined);
      return links.length ? links : [null];
    });
    return identities.length ? identities.every((value) => resolveUrl(value, source) === source)
      : recipes.length === 1 && pageBound && normalizedName(node.name) === normalizedName(recipe.title);
  });
  // Fragment-normalized identity can bind several different recipes to one page.
  // Resolve that ambiguity before collecting photos; never pool competing nodes.
  const recipeImages: ImageCandidate[] = [];
  let candidates = ogImages.length;
  for (const node of associated.length === 1 ? associated : []) {
    const images = Array.isArray(node.image) ? node.image : [node.image];
    for (const image of images) {
      if (++candidates > 20) return null;
      const imageUrl = isRecord(image)
        ? resolveUrl(image.contentUrl, source) ?? resolveUrl(image.url, source) : resolveUrl(image, source);
      if (!imageUrl) continue;
      const width = isRecord(image) ? dimension(image.width) : null;
      const height = isRecord(image) ? dimension(image.height) : null;
      if ((width !== null && width < 160) || (height !== null && height < 90)) continue;
      recipeImages.push({ imageUrl, width, height, order: recipeImages.length });
    }
  }
  const adequate = (image: ImageCandidate) => image.width !== null && image.height !== null && image.width >= 480 && image.height >= 270;
  const unknown = (image: ImageCandidate) => image.width === null || image.height === null;
  const area = (image: ImageCandidate) => (image.width ?? 0) * (image.height ?? 0);
  const smallest = (images: ImageCandidate[]) => images.sort((a, b) => area(a) - area(b) || a.order - b.order)[0];
  const largest = (images: ImageCandidate[]) => images.sort((a, b) => area(b) - area(a) || a.order - b.order)[0];
  const good = smallest(recipeImages.filter(adequate));
  if (good) return { ...good, reason: "recipe-sized" };
  const unmeasured = recipeImages.find(unknown);
  if (unmeasured) return { ...unmeasured, reason: "recipe-unknown" };
  if (pageBound) {
    const social: ImageCandidate[] = [];
    for (const image of ogImages) {
      const imageUrl = resolveUrl(image.secure, source) ?? resolveUrl(image.url, source);
      const width = dimension(image.width), height = dimension(image.height);
      if (imageUrl && !(width !== null && width < 160) && !(height !== null && height < 90)) {
        social.push({ imageUrl, width, height, order: social.length });
      }
    }
    const image = smallest(social.filter(adequate)) ?? social.find(unknown) ?? largest(social);
    if (image) return { ...image, reason: "open-graph" };
  }
  const small = largest(recipeImages);
  return small ? { ...small, reason: "recipe-small" } : null;
}
