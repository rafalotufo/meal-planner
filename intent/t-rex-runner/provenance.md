# T-Rex Runner — pinned provenance and reuse proposal

- Date inspected: 2026-11-24
- Author: senior-developer
- Status: Verified research facts; independent license review required before vendoring
- Research files only: `/private/tmp/trex-provenance-pn4cn5jz`; no downloaded code executed and no game files added to the application.

## Selected extraction

Pin: `wayou/t-rex-runner@5455bfa408ec6b707c7300ff194b7390733a766d`.
[Commit metadata](https://github.com/wayou/t-rex-runner/commit/5455bfa408ec6b707c7300ff194b7390733a766d)
identifies the 2022-06-08 Arcade Mode merge. All selected files were actually
downloaded from raw.githubusercontent.com at that complete SHA, not gh-pages HEAD.
The pinned index.js starts with the 2014 Chromium copyright, BSD reference and
“extract from chromium source code by @liuwayong”. Pinned index.html:22–24
references the two original sprite paths below. Its audio, HTML and scripts
will not be shipped or executed.

| Pinned upstream path | Actual bytes | SHA-256 |
| --- | ---: | --- |
| index.js | 90,241 | `e7a50d337bdbe4299068de034e4564cfe5fd45ca9257ded37b6ada9330cedf0f` |
| index.html | 30,514 | `5d4e912992e8b7d594996b083ddeafa2b034b8d481367d403b20fb1b0ee4a0d3` |
| LICENSE | 1,517 | `c6ba363b8d8d89eab0a8f4775e4fc5dc2dc1c3b649cbf2a0af4049699ee29533` |
| README.md | 1,909 | `e288dd99c159883883f21732b153c9978ce23b1ccffeb131c30136bcd613e3fd` |

Base URL for each exact file:
`https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/`.

## Sprites: exact bytes and proposed local destinations

| Upstream path after base URL | PNG dimensions | Bytes | SHA-256 | Local destination after approval |
| --- | --- | ---: | --- | --- |
| assets/default_100_percent/100-offline-sprite.png | 1233×68 | 2,645 | `e306705c996676db01f4072ed3d6f33d89089a848ab0b2a0ba07a2d866ec309f` | public/games/t-rex/100-offline-sprite.png |
| assets/default_200_percent/200-offline-sprite.png | 2441×130 | 3,244 | `b3011fd16e43cd860b9782c4eafe77c1cc40da2e0f6e2e5ea547d98d6efac879` | public/games/t-rex/200-offline-sprite.png |

Dimensions were parsed from downloaded PNG IHDR bytes; SHA-256 is over the
entire original file. Combined original sprites total 5,889 bytes. Copy bytes
unchanged after approval; no reskin, recompression, data-URL or CDN delivery.
Render only the original dinosaur, ground and single-small-cactus regions.
The 2× sheet is not a naive doubling of every 1× source coordinate: preserve
the upstream LDPI/HDPI source offsets and test their bounds.

## Historical Chromium origin and applicable notice

Upstream [source history commit f5659df799d6d5189a6b6e4bd6e0ca07cc124aab](https://github.com/wayou/t-rex-runner/commit/f5659df799d6d5189a6b6e4bd6e0ca07cc124aab)
explicitly says “extract from latest chrome (v55)” on 2017-01-08. This supports
the historical release choice; it does not identify the exact original source
commit for every later change. Later source changes remain covered by the
selected extraction's own pinned notice as well.

The primary Chromium Gitiles endpoint resolved release `55.0.2883.87` to
immutable commit `12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8` (2016-12-08).
Downloaded historical [LICENSE](https://chromium.googlesource.com/chromium/src/+/12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8/LICENSE)
is 1,559 decoded bytes, SHA-256
`845022e0c1db1abb41a6ba4cd3c4b674ec290f3359d9d3c78ae558d4c0ed9308`.
It begins “Copyright 2015 The Chromium Authors. All rights reserved.” and
includes the BSD redistribution conditions, Google Inc./contributors
non-endorsement clause and full warranty/liability disclaimer. This is the
historical notice to retain; current main/LICENSE was not substituted.

Historical [offline.js](https://chromium.googlesource.com/chromium/src/+/12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8/components/neterror/resources/offline.js)
has the same 2014 Chromium BSD header. A release-tag fetch was 70,539 decoded
bytes, SHA-256 `ddf6b171f09adc28d875975fa50f12026342fdedb4f408702634a43daeac83b9`.
It provides corroborating historical source context, not a claim that the
entire selected wayou index.js is byte-identical to Chromium.

Both historical sprite files were fetched at the immutable Chromium commit:

- [1× sprite](https://chromium.googlesource.com/chromium/src/+/12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8/components/neterror/resources/default_100_percent/offline/100-offline-sprite.png)
- [2× sprite](https://chromium.googlesource.com/chromium/src/+/12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8/components/neterror/resources/default_200_percent/offline/200-offline-sprite.png)

Each decoded byte count, dimensions and entire-file SHA-256 exactly matches
its selected wayou counterpart in the sprite table. This establishes concrete
sprite lineage instead of relying only on a README attribution.

## Notices to preserve and ship

1. Copy complete pinned wayou LICENSE unchanged to
   `third_party/t-rex/LICENSE.wayou.txt`, including “Copyright (c) 2022, 牛さん”,
   all three BSD conditions and full disclaimer.
2. Copy complete decoded historical Chromium LICENSE unchanged to
   `third_party/t-rex/LICENSE.chromium.txt`.
3. Preserve the original index.js lines 1–4 verbatim at the top of adapted
   source files, including the 2014 Chromium copyright and @liuwayong credit.
   Add the wayou pin, this mapping and the local full-notice location.
4. Ship both full notices and original source/extraction credit in
   `public/games/t-rex/THIRD-PARTY-NOTICES.txt`; link to that local file visibly
   from the game. Preserve both source and binary redistribution conditions,
   distinct copyrights, non-endorsement wording and disclaimers.

The existing authenticated/static request policy protects local game images
and notices too; do not make new public exceptions. Verify an authenticated
user can open the notice and both images; anonymous access remains protected.

## Proposed adaptation map (selected index.js line numbers)

| Upstream symbols / ranges | Target | Retained or deliberately changed |
| --- | --- | --- |
| Runner.spriteDefinition, 163–188 | lib/t-rex-canvas.ts | Retain LDPI/HDPI TREX, HORIZON and CACTUS_SMALL offsets; no other sprite modes. |
| checkForCollision/createAdjustedCollisionBox/boxCompare/CollisionBox, 1141–1266 | lib/t-rex-runner.ts | Typed immutable AABB helpers and original running hitboxes; no debug drawing or duck state. |
| Obstacle.types CACTUS_SMALL, 1468–1484 | lib/t-rex-runner.ts and canvas module | Retain 17×35 cactus and collision boxes; fix size=1, deterministic safe gaps, no clusters/birds. |
| Trex.config/collisionBoxes/animFrames, 1562–1643 | lib/t-rex-runner.ts and canvas module | Retain 44×47 dinosaur, RUNNING hitboxes and running/jump/crash frames; omit waiting blink/duck/speed-drop. |
| Trex.draw, 1721–1778 | lib/t-rex-canvas.ts | Adapt source-region drawImage math to owned canvas, fixed logical world and DPR-only backing scale. |
| Trex.startJump/updateJump, 1788–1855 | lib/t-rex-runner.ts | Adapt vertical integration/landing; constant speed, fixed jump arc, no hold/release advantage; cap delta/substep and test solvability. |
| HorizonLine dimensions/draw/update, 2406–2518 | lib/t-rex-canvas.ts | Retain 600×12 ground at logical y=127 and wrapping source segments; injected simulation distance, no singleton/global image. |

Do not reuse Runner.instance_, document-level key/touch handlers, autoplay
bootstrap at 2748–2752, audio, full-page/arcade/night mode or storage. React
owns mounts, scoped events and request association; the instance-owned canvas
controller owns loading, redraw, at-most-one RAF and idempotent disposal.
At implementation, record exact adapted exports/line ranges against this map
and flag any additional reused symbol for independent review.

## Reuse gate

Research resolves pinned bytes and historical license/sprite lineage. Nothing
has been vendored yet. Independent code/security/license review must confirm
the proposed notices and mapping before reuse, then recheck actual shipped
files/hashes/notice access at final review. Any missing required notice or
unresolved origin blocks vendoring; never silently fall back to mutable main.

## Implemented adaptation — 2026-11-24

Following plan/reuse approval, the two exact original PNGs and both full notices
were copied to the proposed destinations. Native asset tests verify hashes,
dimensions, entire license texts in the shipped notice and original extraction
credit. No upstream JavaScript, HTML, audio or bootstrap was executed or shipped.

- `lib/t-rex-runner.ts`: `RUNNING_BOXES`, `CACTUS_BOXES` and `hasCollision`
  adapt the mapped collision helpers/boxes; `jumpRunner`/`tickRunner` adapt jump
  integration and landing. Intentional constants are 240px/s, -600px/s initial
  jump velocity and 2160px/s² gravity, with fixed-arc integration, 50ms cap and
  <=1000/60ms substeps. A seeded local generator replaces upstream randomness;
  300–420px empty cactus gaps are each simulated as jumpable in tests.
- `lib/t-rex-canvas.ts`: `SPRITE_LAYOUT` retains original LDPI/HDPI offsets;
  `draw` uses mapped Trex frames (0/88/132/220), small cactus and HorizonLine
  source regions/wrapping. `mountRunnerCanvas` replaces global singleton,
  listeners and images with one disposable instance. CSS fills available width
  per Rafael's amendment; logical world and collision stay 600×150.
- `lib/t-rex-session.ts` and `app/t-rex-runner.tsx` contain new request/state and
  React integration rather than copied upstream lifecycle or page code.

Both adapted upstream-derived modules retain the original four-line header,
full source pin and local full-notice reference. Final independent review must
assess the shipped mapping/notices as well as the already-cleared proposal.
