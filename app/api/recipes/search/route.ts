import { searchRecipes } from "../../../../lib/recipes/server";
import { requireFamilyContext } from "../../../../lib/session";
import { FamilyError } from "../../../../lib/identity-access";
import { noStore } from "../../../../lib/auth-policy";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  try {
    await requireFamilyContext(request.headers);
  } catch (error) {
    return Response.json({ error: error instanceof FamilyError ? error.message : "Authentication unavailable" }, { status: error instanceof FamilyError ? error.status : 503, headers: noStore });
  }
  return searchRecipes(request);
}
