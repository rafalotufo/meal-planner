import { NextRequest } from 'next/server';
import { requireFamilyContext } from '../../../lib/session';
import { apiResponse } from '../../../lib/http';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  return apiResponse(async () => { await requireFamilyContext(request.headers); return { authenticated: true }; });
}
