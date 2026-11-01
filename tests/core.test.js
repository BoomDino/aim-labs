import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rotation,
  convert,
  cm360,
  score,
  hitSphere,
  direction,
  rank,
} from "../web/core.js";
test("a full turn and conversion preserve physical rotation", () => {
  for (const game of ["cs2", "valorant"]) {
    const sens = 0.37,
      other = game === "cs2" ? "valorant" : "cs2";
    assert.ok(
      Math.abs(
        rotation(500, sens, game) -
          rotation(500, convert(sens, game, other), other),
      ) < 1e-12,
    );
  }
  assert.ok(Math.abs(rotation(360 / 0.022, 1, "cs2") - 2 * Math.PI) < 1e-12);
  assert.ok(Math.abs(cm360(1, 800, "cs2") - 51.9545454545) < 1e-8);
});
test("sphere hit testing rejects misses and targets behind player", () => {
  assert.equal(hitSphere(direction(0, 0), [0, 0, 15]), true);
  assert.equal(hitSphere(direction(0, 0), [0.6, 0, 15]), true);
  assert.equal(hitSphere(direction(0, 0), [0.8, 0, 15]), false);
  assert.equal(hitSphere(direction(0, 0), [1, 0, 15]), false);
  assert.equal(hitSphere(direction(0, 0), [0, 0, -15]), false);
  assert.equal(hitSphere(direction(Math.PI / 2, 0), [15, 0, 0]), true);
});
test("score penalizes misses and handles empty session", () => {
  assert.equal(score(10, 10), 1000);
  assert.equal(score(10, 20), 500);
  assert.equal(score(0, 0), 0);
});
test("leaderboard caps and sorts scores", () => {
  const rows = Array.from({ length: 25 }, (_, i) => ({
    score: i,
    accuracy: 100,
    date: "2026-11-01",
  }));
  const result = rank(rows);
  assert.equal(result.length, 20);
  assert.equal(result[0].score, 24);
});
