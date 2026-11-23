import { NextResponse } from 'next/server';
import { apiResponse, readJson } from '../../../lib/http';
import { authConfiguration } from '../../../lib/auth';
import { contextCookie } from '../../../lib/invitation-context';
import { FamilyError } from '../../../lib/identity-access';
import { noStore } from '../../../lib/auth-policy';
export async function POST(request: Request) {
  return apiResponse(async () => {
    const body = await readJson(request, ['token']);
    if (typeof body.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(body.token)) throw new FamilyError(400, 'Invalid request');
    return new NextResponse(null, { status: 204, headers: { ...noStore, 'Set-Cookie': contextCookie(authConfiguration().origin, body.token) } });
  });
}
