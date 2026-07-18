// Fuso horário padrão do sistema (caso não seja definido no .env)
const DEFAULT_TIME_ZONE = "America/Maceio";

/**
 * Retorna o fuso horário configurado para a aplicação.
 */
function appTimeZone() {
  return process.env.APP_TIME_ZONE?.trim() || DEFAULT_TIME_ZONE;
}

/**
 * Retorna as partes da data (ano, mês, dia, etc.) no fuso horário configurado da aplicação.
 */
function partsInTimeZone(date: Date, includeTime = false) {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: appTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23" as const,
    }),
  };
  const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: includeTime ? value("hour") : 0,
    minute: includeTime ? value("minute") : 0,
    second: includeTime ? value("second") : 0,
  };
}

/**
 * Formata um objeto Date para uma string contendo apenas a data (YYYY-MM-DD) no fuso horário local.
 */
function dateOnly(date: Date) {
  const { year, month, day } = partsInTimeZone(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Encontra o instante UTC exato que representa o início do dia (meia-noite) de uma data no fuso local.
 */
function startOfDay(date: string) {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const wanted = Date.UTC(year, month - 1, day);
  let instant = wanted;

  // Algoritmo de ajuste interativo para lidar com mudanças de horário (como horário de verão/offsets complexos).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const local = partsInTimeZone(new Date(instant), true);
    const offset =
      Date.UTC(
        local.year,
        local.month - 1,
        local.day,
        local.hour,
        local.minute,
        local.second,
      ) - instant;
    const adjusted = wanted - offset;
    if (adjusted === instant) break;
    instant = adjusted;
  }

  return new Date(instant);
}

/**
 * Retorna a data de hoje formatada como 'YYYY-MM-DD' no fuso configurado.
 */
export function currentCalendarDate(now = new Date()) {
  return dateOnly(now);
}

/**
 * Retorna a data da segunda-feira da semana atual formatada como 'YYYY-MM-DD'.
 */
export function startOfCurrentWeekDate(now = new Date()) {
  const localDate = new Date(`${dateOnly(now)}T00:00:00.000Z`);
  localDate.setUTCDate(
    localDate.getUTCDate() - ((localDate.getUTCDay() + 6) % 7),
  );
  return localDate.toISOString().slice(0, 10);
}

/**
 * Retorna o Date object representando o início exato (meia-noite local) da segunda-feira da semana atual.
 */
export function startOfCurrentWeekInstant(now = new Date()) {
  return startOfDay(startOfCurrentWeekDate(now));
}

