import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import allowedGoogleEmails from "./allowed-google-emails.json";
import { isAllowedGoogleUser } from "./google-access";

export async function readSession(requestHeaders: Headers) {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  return session && isAllowedGoogleUser(session.user, allowedGoogleEmails) ? session : null;
}

// Every new page, endpoint, and action must authenticate before reading data or mutating it.
export async function requirePageSession() {
  const session = await readSession(await headers());
  if (!session) redirect("/sign-in");
  return session;
}
