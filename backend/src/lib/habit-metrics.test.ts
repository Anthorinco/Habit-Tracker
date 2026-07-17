import assert from "node:assert/strict";
import test from "node:test";
import { summarizeHabit } from "./habit-metrics.js";

test("summarizes the current week, streak, month and motivation color", () => {
  const now = new Date("2026-07-17T12:00:00.000Z");
  const history = [13, 14, 15, 16, 17].map(
    (day) => new Date(`2026-07-${day}T00:00:00.000Z`),
  );

  assert.deepEqual(summarizeHabit(history, now), {
    historicoSemanal: [
      { data: "2026-07-13", concluido: true },
      { data: "2026-07-14", concluido: true },
      { data: "2026-07-15", concluido: true },
      { data: "2026-07-16", concluido: true },
      { data: "2026-07-17", concluido: true },
      { data: "2026-07-18", concluido: false },
      { data: "2026-07-19", concluido: false },
    ],
    sequenciaAtual: 5,
    conclusoesNoMes: 5,
    corMotivacao: "verde",
  });
});

test("keeps Sunday night inside the current week in the configured timezone", () => {
  const previousTimeZone = process.env.APP_TIME_ZONE;
  process.env.APP_TIME_ZONE = "America/Maceio";

  try {
    const summary = summarizeHabit(
      [new Date("2026-07-19T00:00:00.000Z")],
      new Date("2026-07-20T00:30:00.000Z"),
    );

    assert.deepEqual(summary.historicoSemanal, [
      { data: "2026-07-13", concluido: false },
      { data: "2026-07-14", concluido: false },
      { data: "2026-07-15", concluido: false },
      { data: "2026-07-16", concluido: false },
      { data: "2026-07-17", concluido: false },
      { data: "2026-07-18", concluido: false },
      { data: "2026-07-19", concluido: true },
    ]);
    assert.equal(summary.sequenciaAtual, 1);
    assert.equal(summary.conclusoesNoMes, 1);
  } finally {
    if (previousTimeZone === undefined) delete process.env.APP_TIME_ZONE;
    else process.env.APP_TIME_ZONE = previousTimeZone;
  }
});

test("counts the local calendar month near a UTC month boundary", () => {
  const previousTimeZone = process.env.APP_TIME_ZONE;
  process.env.APP_TIME_ZONE = "America/Maceio";

  try {
    const summary = summarizeHabit(
      [
        new Date("2026-07-31T00:00:00.000Z"),
        new Date("2026-08-01T00:00:00.000Z"),
      ],
      new Date("2026-08-01T01:30:00.000Z"),
    );

    assert.equal(summary.conclusoesNoMes, 1);
  } finally {
    if (previousTimeZone === undefined) delete process.env.APP_TIME_ZONE;
    else process.env.APP_TIME_ZONE = previousTimeZone;
  }
});
