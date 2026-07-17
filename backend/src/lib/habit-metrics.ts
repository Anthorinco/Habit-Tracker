export type MotivationColor = "verde" | "amarelo" | "vermelho";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function atUtcMidnight(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcWeek(date: Date) {
  const start = atUtcMidnight(date);
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

export function summarizeHabit(history: Date[], now = new Date()) {
  const completedDates = new Set(history.map(formatDate));
  const weekStart = startOfUtcWeek(now);
  const historicoSemanal = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_IN_MS);
    const data = formatDate(date);
    return { data, concluido: completedDates.has(data) };
  });

  const today = atUtcMidnight(now);
  let cursor = completedDates.has(formatDate(today))
    ? today
    : new Date(today.getTime() - DAY_IN_MS);
  let sequenciaAtual = 0;

  while (completedDates.has(formatDate(cursor))) {
    sequenciaAtual += 1;
    cursor = new Date(cursor.getTime() - DAY_IN_MS);
  }

  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const conclusoesNoMes = history.filter(
    (date) => date.getUTCMonth() === month && date.getUTCFullYear() === year,
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
