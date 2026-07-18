import {
  currentCalendarDate,
  startOfCurrentWeekDate,
} from "./calendar.js";

// Tipagem para os status de cor motivacional do hábito
export type MotivationColor = "verde" | "amarelo" | "vermelho";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Formata um Date object para string no formato YYYY-MM-DD.
 */
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Consolida as métricas de um hábito com base no seu histórico completo de conclusões:
 * - Histórico semanal (marcação de concluído ou não para cada um dos 7 dias da semana corrente)
 * - Sequência atual (streak) de dias seguidos concluídos até ontem ou hoje
 * - Total de conclusões no mês atual
 * - Cor de motivação (verde para streak >= 5, amarelo para >= 2, vermelho para < 2)
 */
export function summarizeHabit(history: Date[], now = new Date()) {
  const completedDates = new Set(history.map(formatDate));
  
  // 1. Gera o histórico dos 7 dias da semana atual
  const weekStart = new Date(`${startOfCurrentWeekDate(now)}T00:00:00.000Z`);
  const historicoSemanal = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart.getTime() + index * DAY_IN_MS);
    const data = formatDate(date);
    return { data, concluido: completedDates.has(data) };
  });

  // 2. Calcula a sequência atual (streak) de conclusões diárias consecutivas
  const today = new Date(`${currentCalendarDate(now)}T00:00:00.000Z`);
  let cursor = completedDates.has(formatDate(today))
    ? today
    : new Date(today.getTime() - DAY_IN_MS);
  let sequenciaAtual = 0;

  while (completedDates.has(formatDate(cursor))) {
    sequenciaAtual += 1;
    cursor = new Date(cursor.getTime() - DAY_IN_MS);
  }

  // 3. Calcula o total de conclusões no mês calendário vigente
  const currentMonth = formatDate(today).slice(0, 7);
  const conclusoesNoMes = history.filter((date) =>
    formatDate(date).startsWith(currentMonth),
  ).length;
  
  // 4. Determina a cor visual baseada no streak
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

