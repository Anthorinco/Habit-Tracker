import {
  currentCalendarDate,
  startOfCurrentWeekDate,
} from "./calendar.js";

export type MotivationColor = "verde" | "amarelo" | "vermelho";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function summarizeHabit(history: Date[], now = new Date()) {
  const completedDates = new Set(history.map(formatDate));
  const weekStart = new Date(`${startOfCurrentWeekDate(now)}T00:00:00.000Z`);
  const historicoSemanal = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_IN_MS);
    const data = formatDate(date);
    return { data, concluido: completedDates.has(data) };
  });

  const today = new Date(`${currentCalendarDate(now)}T00:00:00.000Z`);
  let cursor = completedDates.has(formatDate(today))
    ? today
    : new Date(today.getTime() - DAY_IN_MS);
  let sequenciaAtual = 0;

  while (completedDates.has(formatDate(cursor))) {
    sequenciaAtual += 1;
    cursor = new Date(cursor.getTime() - DAY_IN_MS);
  }

  const currentMonth = formatDate(today).slice(0, 7);
  const conclusoesNoMes = history.filter((date) =>
    formatDate(date).startsWith(currentMonth),
  ).length;
  const corMotivacao: MotivationColor =
    sequenciaAtual >= 5
      ? "verde"
      : sequenciaAtual >= 2
        ? "amarelo"
        : "vermelho";

  return {
    historicoSemanal,
    sequenciaAtual,
    conclusoesNoMes,
    corMotivacao,
  };
}
