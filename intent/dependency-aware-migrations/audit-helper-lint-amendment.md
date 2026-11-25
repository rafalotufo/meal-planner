# Historical helper lint amendment

2026-11-24, independently assessed by reviewer during this feature.

Required repository lint exposed a pre-existing unused binding at line54 of
`org/merge/recipe-url-menu-main-local-2026-11-24/native-cutover-helper.mjs`.
The implementation removes only `const child =` from the existing awaited
execution call; the call and runtime behavior are preserved. The helper was not
executed. No migration, restart, cutover or other operational authority follows.

The exact historically reviewed helper bytes from source commit
`0c6a38b36e7652971ac95004df73b9040f878278` are preserved at
`org/merge/recipe-url-menu-main-local-2026-11-24/native-cutover-helper.reviewed-source.txt`.
Their SHA256 is `0952712550288485eed299f15a22f221eb1b0feb5d39f7efdeac4ac67130de1f`.
The historical `.sha256.json` and security review remain unchanged and refer to
those original bytes, not this lint-only revision. The revised helper SHA256 is
`dfd1db4dbfd13b964a9ccd2647c7114bfa73ce167666d1364577a531200910cf`.

This records provenance rather than retroactively extending the old security
review to a changed file. No lint exclusion, suppression or quality threshold
change was introduced.
