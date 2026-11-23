import { NextRequest, NextResponse } from "next/server";
import { noStore } from "../../../lib/auth-policy";
import { readSession } from "../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!await readSession(request.headers)) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStore });
    return NextResponse.json({ authenticated: true }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "Authentication unavailable" }, { status: 503, headers: noStore });
  }
}
