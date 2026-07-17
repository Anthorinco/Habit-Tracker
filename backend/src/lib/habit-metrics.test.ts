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
