# Independent authentication regression mutation evidence

Date: 2026-11-23. Reviewer: independent reviewer. Node v24.15.0.

Copied the developer-confirmed final production `.next` build using APFS
copy-on-write into an owned isolated `/private/tmp/meal-auth-review-mutation-*`
project, with copies of tests/configuration and a read-only-use node_modules
symlink. No shared source, production build, dependencies or workflow state
was mutated. No alternate production verifier was added.

In the isolated compiled proxy only, inverted its session truthiness exactly
once: `||await jY(a.headers)` became `||!await jY(a.headers)`. Executed
`node --test tests/auth/access.test.mjs tests/auth/oauth.test.mjs` using the
repository's absolute Node 24 executable. The mutation run exited 1: eight
tests, six passed and two failed. Failures detected both the anonymous-boundary
redirect regression and a valid Google session receiving 307 instead of the
expected home-page 200.

Restored that single copied-build expression and ran the identical command
against the same isolated project. It exited 0: eight tests passed, zero
failed/skipped/cancelled. This control demonstrates that the deliberately
broken guard caused the failures. The pure policy/browser-bundle tests also
passed independently (three tests) in the shared checkout without mutations.

A first attempt outside the repository selected a broken legacy Homebrew Node
binary; it failed before executing any tests. Both reported mutation/control
results use `/Users/rafael/.nvm/versions/node/v24.15.0/bin/node` explicitly.

The owned temporary project was removed after restoring the copied guard and
confirming its ownership marker. This experiment establishes regression
sensitivity of the HTTP boundary, not live Google credentials, deployment or
application security clearance. Subsequent nonsemantic matcher conversion to
TypeScript does not change the mutated proxy/session guard; normal final
checks still apply to the delivered source.
