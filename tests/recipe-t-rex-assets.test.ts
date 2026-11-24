import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SPRITE_LAYOUT } from "../lib/t-rex-canvas";

test("T-Rex sprites retain verified pinned Chromium bytes and dimensions", () => {
  for (const [name, bytes, width, height, hash] of [
    ["100", 2645, 1233, 68, "e306705c996676db01f4072ed3d6f33d89089a848ab0b2a0ba07a2d866ec309f"],
    ["200", 3244, 2441, 130, "b3011fd16e43cd860b9782c4eafe77c1cc40da2e0f6e2e5ea547d98d6efac879"],
  ] as const) {
    const data = readFileSync(`public/games/t-rex/${name}-offline-sprite.png`);
    assert.equal(data.length, bytes);
    assert.equal(data.readUInt32BE(16), width);
    assert.equal(data.readUInt32BE(20), height);
    assert.equal(createHash("sha256").update(data).digest("hex"), hash);
  }
});

test("original 1x/2x running, jumping, crash, ground and cactus crops fit their sheets", () => {
  for (const scale of [1, 2] as const) {
    const sprite = SPRITE_LAYOUT[scale];
    for (const frame of [0, 88, 132, 220]) {
      assert.ok(sprite.trexX + (frame + 44) * scale <= sprite.width);
      assert.ok(sprite.trexY + 47 * scale <= sprite.height);
    }
    assert.ok(sprite.cactusX + 17 * scale <= sprite.width);
    assert.ok(sprite.cactusY + 35 * scale <= sprite.height);
    assert.ok(sprite.groundX + 600 * scale <= sprite.width);
    assert.ok(sprite.groundY + 12 * scale <= sprite.height);
  }
});

test("both exact BSD notices and extraction credit ship with local game assets", () => {
  const upstream = readFileSync("third_party/t-rex/LICENSE.wayou.txt");
  const chromium = readFileSync("third_party/t-rex/LICENSE.chromium.txt");
  assert.equal(createHash("sha256").update(upstream).digest("hex"), "c6ba363b8d8d89eab0a8f4775e4fc5dc2dc1c3b649cbf2a0af4049699ee29533");
  assert.equal(createHash("sha256").update(chromium).digest("hex"), "845022e0c1db1abb41a6ba4cd3c4b674ec290f3359d9d3c78ae558d4c0ed9308");
  const shipped = readFileSync("public/games/t-rex/THIRD-PARTY-NOTICES.txt", "utf8");
  assert.ok(shipped.includes(upstream.toString("utf8")));
  assert.ok(shipped.includes(chromium.toString("utf8")));
  assert.match(shipped, /Copyright \(c\) 2014 The Chromium Authors/);
  assert.match(shipped, /extract from chromium source code by @liuwayong/);
});
