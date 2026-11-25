# Brave parallel search — implementation verification

Implementation in progress; this is actual command evidence, not final readiness.

- Queue/Brave slice red: `pnpm test` failed with missing new modules in
  `/private/tmp/brave-slice1-red.log` before implementation.
- Queue/Brave slice green: `pnpm test` passed88 tests,0 failures (compiled strict
  TypeScript + native runner), `/private/tmp/brave-slice1-green.log`.
- Focused regressions cover retained active leases for abort-ignoring transports,
  FIFO/global concurrency, bounded queued work/removal, one exact Brave request,
  safe URL filtering/dedup, Unicode/word query bound and malformed/oversized
  provider responses. Full source/body pipeline checks follow in next slices.

- Source extraction/collection slice red: missing source module in
  `/private/tmp/brave-slice2-red.log` before implementation.
- Source extraction/collection slice green: `pnpm test` passed92 tests,0 failures
  before the additional provider-error-body regression. Tests cover canonical/
  recipe/title association, embedded collection recipes, safe bounded content
  links, ignored HTML base/navigation, malformed/oversized/deep source data and
  missing cooking evidence. Existing photo transport/metadata tests remain.
- Early security consultation identified non-2xx body cleanup. Discovery now
  cancels an error response body before returning failure; shared curator reader
  will reuse that behavior. No private provider body is surfaced.
- Final source/discovery suite after cleanup regression:93/93 pass,
  `/private/tmp/brave-slice2-final.log`.

- Curator/orchestration slice red: missing curation/parallel-search modules in
  `/private/tmp/brave-slice3-red.log` before implementation.
- Body-cancellation lease regression reproduced early release against an
  abort-ignoring ReadableStream cancel hook (`/private/tmp/brave-body-red.log`).
  Fixed shared reader to retain the cancellation promise before releasing its
  active pool lease, including oversize and already-aborted bodies.
- Curator/orchestration suite green: strict schema, full original query, no
  tools/retries, deterministic metadata, required excerpt/title failures,
  twelve concurrent calls, source/model ceilings, collection expansion,
  technical/rejection distinction, parent abort and shared-instance pools.
  Final recipe suite103/103 pass in `/private/tmp/brave-slice3-final.log`.
