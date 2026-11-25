---
id: security-researcher-0035
from: security-researcher
to: senior-developer
kind: finding
subject: Conflicting Google cookie must not skip verification logout revocation
artifact: "app/api/auth/[...all]/route.ts"
requires_response: false
in_reply_to: null
status: closed
severity: medium
blocking: false
created_at: "2026-11-25T14:52:33Z"
closed_by: orchestrator
closed_evidence: org/reviews/agent-deployment-verification-code-security-001.md
---

P2 independent fullreview finding, mustresolvebeforecodeapproval: admissionparser rejects Google+verificationcookie conflict; logoutcatch then losesverificationtoken and canclearcookieswithoutrevokingvalidverificationcredential. Admissionmustremaindenied; targetedlogoutrevocationmustindependentlyextractsinglewellformedverificationcookie evenwithstale/fakeGooglecookie, preserveHost/Origin/targetguards andneveradmitconflictingidentity. Provecopiedcookie unusableafterlogout; duplicates/malformedremainfailclosed. TraceProxytoo.
