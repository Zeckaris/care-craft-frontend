/**
 * Calendar dates from the academic API are school-timezone dates encoded as
 * ISO timestamps (usually 00:00Z, legacy rows may be 21:00Z the previous day).
 * Never format them with `new Date(iso)` and the browser's local timezone.
 */
export const DEFAULT_SCHOOL_TIMEZONE = "Africa/Addis_Ababa";

/**
 * Converts an ISO timestamp (or Date) to the school-timezone calendar date as
 * `YYYY-MM-DD`. Returns an empty string for missing/invalid input.
 */
export function toSchoolDate(
  value: string | Date | null | undefined,
  timeZone: string = DEFAULT_SCHOOL_TIMEZONE,
): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}
