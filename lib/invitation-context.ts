export function invitationCookieName(origin: string) { return origin.startsWith('https:') ? '__Host-meal.invitation' : 'meal.invitation'; }
export function invitationContext(headers: Headers, origin: string) {
  const name = invitationCookieName(origin);
  const pair = (headers.get('cookie') ?? '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  const token = pair?.slice(name.length + 1) ?? '';
  return { present: pair !== undefined, token: /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null };
}
export function contextCookie(origin: string, token: string | null) {
  return `${invitationCookieName(origin)}=${token ?? ''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${token ? 604800 : 0}${origin.startsWith('https:') ? '; Secure' : ''}`;
}
