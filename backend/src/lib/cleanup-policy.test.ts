import assert from "node:assert/strict";
import test from "node:test";
import { startOfCurrentWeek } from "./cleanup-policy.js";

test("weekly cleanup keeps priorities created from Monday onward", () => {
  const friday = new Date("2026-07-17T18:30:00.000Z");

  assert.equal(
    startOfCurrentWeek(friday).toISOString(),
    "2026-07-13T00:00:00.000Z",
  );
});
