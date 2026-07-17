const DEFAULT_TIME_ZONE = "America/Maceio";

function appTimeZone() {
  return process.env.APP_TIME_ZONE?.trim() || DEFAULT_TIME_ZONE;
}

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

function dateOnly(date: Date) {
  const { year, month, day } = partsInTimeZone(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function startOfDay(date: string) {
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const wanted = Date.UTC(year, month - 1, day);
  let instant = wanted;

  // Converte meia-noite do calendário configurado para o instante UTC correto.
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

export function currentCalendarDate(now = new Date()) {
  return dateOnly(now);
}

export function startOfCurrentWeekDate(now = new Date()) {
  const localDate = new Date(`${dateOnly(now)}T00:00:00.000Z`);
  localDate.setUTCDate(
    localDate.getUTCDate() - ((localDate.getUTCDay() + 6) % 7),
  );
  return localDate.toISOString().slice(0, 10);
}

export function startOfCurrentWeekInstant(now = new Date()) {
  return startOfDay(startOfCurrentWeekDate(now));
}
