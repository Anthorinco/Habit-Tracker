import assert from "node:assert/strict";
import test from "node:test";
import { startOfCurrentWeek } from "./cleanup-policy.js";

test("weekly cleanup keeps priorities created from Monday onward", () => {
  const previousTimeZone = process.env.APP_TIME_ZONE;
  process.env.APP_TIME_ZONE = "America/Maceio";
  const friday = new Date("2026-07-17T18:30:00.000Z");

  try {
    assert.equal(
      startOfCurrentWeek(friday).toISOString(),
      "2026-07-13T03:00:00.000Z",
    );
  } finally {
    if (previousTimeZone === undefined) delete process.env.APP_TIME_ZONE;
    else process.env.APP_TIME_ZONE = previousTimeZone;
  }
});

test("weekly cleanup does not advance during Sunday night in Maceio", () => {
  const previousTimeZone = process.env.APP_TIME_ZONE;
  process.env.APP_TIME_ZONE = "America/Maceio";

  try {
    assert.equal(
      startOfCurrentWeek(new Date("2026-07-20T00:30:00.000Z")).toISOString(),
      "2026-07-13T03:00:00.000Z",
    );
  } finally {
    if (previousTimeZone === undefined) delete process.env.APP_TIME_ZONE;
    else process.env.APP_TIME_ZONE = previousTimeZone;
  }
});
