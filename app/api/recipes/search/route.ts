import { searchRecipes } from "../../../../lib/recipes/server";
import { readSession } from "../../../../lib/session";
import { noStore } from "../../../../lib/auth-policy";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    if (!await readSession(request.headers)) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
    }
  } catch {
    return Response.json({ error: "Authentication unavailable" }, { status: 503, headers: noStore });
  }
  return searchRecipes(request);
}
