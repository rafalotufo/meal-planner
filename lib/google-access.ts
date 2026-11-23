const gmailAddress = /^[a-z0-9]+(?:\.[a-z0-9]+)*(?:\+[a-z0-9_-]+(?:\.[a-z0-9_-]+)*)?@gmail\.com$/;

export function validateGoogleAccessList(allowedEmails: unknown): string[] {
  if (!Array.isArray(allowedEmails)) {
    throw new Error("Authentication unavailable");
  }
  return allowedEmails.map((entry: unknown) => {
    if (typeof entry !== "string") {
      throw new Error("Authentication unavailable");
    }
    const email = entry.trim().toLowerCase();
    if (!gmailAddress.test(email)) {
      throw new Error("Authentication unavailable");
    }
    return email;
  });
}

export function isAllowedGoogleUser(user: unknown, allowedEmails: unknown): boolean {
  const allowed = validateGoogleAccessList(allowedEmails);
  if (
    !user ||
    typeof user !== "object" ||
    !("email" in user) ||
    !("emailVerified" in user) ||
    user.emailVerified !== true ||
    typeof user.email !== "string"
  ) {
    return false;
  }
  // Exact address matching deliberately preserves dots, plus suffixes, and domains.
  return allowed.includes(user.email.trim().toLowerCase());
}
