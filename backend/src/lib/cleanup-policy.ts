import { startOfCurrentWeekInstant } from "./calendar.js";

/**
 * Retorna o instante exato (Date) que define o início da semana atual para fins de autolimpeza das prioridades.
 */
export function startOfCurrentWeek(now = new Date()) {
  return startOfCurrentWeekInstant(now);
}

