import { startOfCurrentWeekInstant } from "./calendar.js";

export function startOfCurrentWeek(now = new Date()) {
  return startOfCurrentWeekInstant(now);
}
