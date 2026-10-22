import type { AcademicStatus } from "@carecraft/types";

/** `calendarId` is a raw id in some term responses and populated in others. */
export type CalendarIdValue =
  | string
  | { _id: string }
  | null
  | undefined;

export function normalizeCalendarId(value: CalendarIdValue): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id;
}

/**
 * A current item is genuinely in session today. A fallback item is the latest
 * one returned by the backend when nothing is in session, so it must not be
 * presented as current.
 */
export type AcademicDisplayKind = "current" | "latest" | "upcoming" | "past";

export function academicDisplayKind(
  status: AcademicStatus,
  isCurrent: boolean,
): AcademicDisplayKind {
  if (status === "current") return "current";
  if (isCurrent) return "latest";
  return status;
}

const DISPLAY_COLORS: Record<AcademicDisplayKind, string> = {
  current: "green",
  latest: "blue",
  upcoming: "blue",
  past: "default",
};

const DISPLAY_LABELS: Record<AcademicDisplayKind, string> = {
  current: "Current",
  latest: "Latest",
  upcoming: "Upcoming",
  past: "Past",
};

export function academicDisplayColor(kind: AcademicDisplayKind): string {
  return DISPLAY_COLORS[kind] ?? "default";
}

export function academicDisplayLabel(kind: AcademicDisplayKind): string {
  return DISPLAY_LABELS[kind] ?? "Unknown";
}

/** Only a genuinely current item gets the strong highlight. */
export function isAcademicCurrentHighlight(status: AcademicStatus): boolean {
  return status === "current";
}
