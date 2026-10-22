import type {
  DayOfWeek,
  IBellSchedule,
  IPrecheckRefs,
  IScheduleBlock,
  IScheduleDerived,
  IScheduleDerivedPeriod,
  IScheduleRequirementItem,
} from "@carecraft/types";

// ---------------------------------------------------------------------------
// Days
// ---------------------------------------------------------------------------

export const ALL_DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
export const WEEKDAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export const dayLabel = (day: DayOfWeek | string): string =>
  DAY_LABELS[day as DayOfWeek] ?? String(day);

// ---------------------------------------------------------------------------
// Presets / defaults
// ---------------------------------------------------------------------------

const period = (durationMinutes = 50): IScheduleBlock => ({
  type: "period",
  durationMinutes,
  label: null,
});

const breakBlock = (label: string, durationMinutes: number): IScheduleBlock => ({
  type: "break",
  durationMinutes,
  label,
});

export interface SchedulePreset {
  key: string;
  label: string;
  blocks: IScheduleBlock[];
}

/** About 50-minute periods, a 15-minute short break and a 45-minute long break. */
export const SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    key: "3-2-2",
    label: "3 periods, short break, 2 periods, long break, 2 periods",
    blocks: [
      period(),
      period(),
      period(),
      breakBlock("Short break", 15),
      period(),
      period(),
      breakBlock("Long break", 45),
      period(),
      period(),
    ],
  },
  {
    key: "4-1-2",
    label: "4 periods, short break, 1 period, long break, 2 periods",
    blocks: [
      period(),
      period(),
      period(),
      period(),
      breakBlock("Short break", 15),
      period(),
      breakBlock("Long break", 45),
      period(),
      period(),
    ],
  },
];

/** Default start time for both presets. */
export const DEFAULT_START_TIME = "08:30";

/**
 * Copies blocks keeping only the fields the backend accepts. Anything the
 * server added to a stored block (for example an `_id`) is dropped so it is
 * never sent back in a PUT.
 */
export const cloneBlocks = (blocks: IScheduleBlock[]): IScheduleBlock[] =>
  blocks.map((b) => ({
    type: b.type,
    durationMinutes: b.durationMinutes,
    label: b.label ?? null,
  }));

export const defaultBellSchedule = (): IBellSchedule => ({
  startTime: DEFAULT_START_TIME,
  blocks: cloneBlocks(SCHEDULE_PRESETS[0].blocks),
});

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------

export const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const parseTimeToMinutes = (time: string): number | null => {
  if (!HHMM_RE.test(time ?? "")) return null;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const minutesToTime = (totalMinutes: number): string => {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/**
 * Shared 12-hour display formatter (re-exported from `@carecraft/utils` so the
 * whole Schedule area, and later grid, print, and teacher screens, use one helper).
 */
export { formatTime12Hour } from "@carecraft/utils";

/**
 * Renders period groups (the counts between breaks) as plain text.
 *
 * @example formatPeriodGroups([3, 2, 2]) // "3, 2 and 2 periods between breaks"
 */
export const formatPeriodGroups = (groups: number[]): string => {
  if (!groups.length) return "";
  if (groups.length === 1) {
    return `${groups[0]} period${groups[0] === 1 ? "" : "s"}`;
  }
  const head = groups.slice(0, -1).join(", ");
  const last = groups[groups.length - 1];
  return `${head} and ${last} periods between breaks`;
};

// ---------------------------------------------------------------------------
// Client-side bell schedule computation + validation
// ---------------------------------------------------------------------------

export interface ComputeOptions {
  /** Minimum number of teaching periods (5 for weekdays, 1 for Saturday). */
  minPeriods: number;
  /** Maximum number of teaching periods (8 for both). */
  maxPeriods: number;
}

export interface ComputedSchedule {
  periods: IScheduleDerivedPeriod[];
  periodsPerDay: number;
  finishTime: string | null;
  /** Period counts between breaks, e.g. `[3, 2, 2]`. */
  groups: number[];
  errors: string[];
  valid: boolean;
}

/**
 * Computes the preview (period start/end times, finish time, period groups)
 * and the list of validation errors for a bell schedule. This mirrors the
 * backend rules so the editor can block invalid saves.
 */
export function computeSchedule(
  schedule: IBellSchedule,
  { minPeriods, maxPeriods }: ComputeOptions
): ComputedSchedule {
  const errors: string[] = [];
  const blocks = Array.isArray(schedule?.blocks) ? schedule.blocks : [];
  const start = parseTimeToMinutes(schedule?.startTime ?? "");

  if (start === null) {
    errors.push("Start time must be a valid time in HH:mm format.");
  }

  if (blocks.length === 0) {
    errors.push("Add at least one block to the bell schedule.");
  }

  blocks.forEach((block, index) => {
    const duration = block?.durationMinutes;
    if (!Number.isInteger(duration) || (duration as number) < 1) {
      errors.push(
        `Block ${index + 1} needs a positive whole number of minutes.`
      );
    }
  });

  if (blocks[0]?.type === "break") {
    errors.push("The schedule cannot start with a break.");
  }
  if (blocks[blocks.length - 1]?.type === "break") {
    errors.push("The schedule cannot end with a break.");
  }
  for (let i = 1; i < blocks.length; i += 1) {
    if (blocks[i]?.type === "break" && blocks[i - 1]?.type === "break") {
      errors.push("Two breaks cannot be adjacent.");
      break;
    }
  }

  const periodCount = blocks.filter((b) => b?.type === "period").length;
  if (blocks.length > 0) {
    if (periodCount < minPeriods) {
      errors.push(
        `A bell schedule needs at least ${minPeriods} period${
          minPeriods === 1 ? "" : "s"
        } (found ${periodCount}).`
      );
    }
    if (periodCount > maxPeriods) {
      errors.push(
        `A bell schedule allows at most ${maxPeriods} periods (found ${periodCount}).`
      );
    }
  }

  const periods: IScheduleDerivedPeriod[] = [];
  const groups: number[] = [];
  let finishTime: string | null = null;

  const durationsValid = blocks.every(
    (b) => Number.isInteger(b?.durationMinutes) && b.durationMinutes >= 1
  );

  if (start !== null && durationsValid && blocks.length > 0) {
    let cursor = start;
    let run = 0;
    for (const block of blocks) {
      if (block.type === "period") {
        const from = cursor;
        const to = cursor + block.durationMinutes;
        periods.push({
          index: periods.length,
          start: minutesToTime(from),
          end: minutesToTime(to),
          startMinutes: from,
          endMinutes: to,
        });
        cursor = to;
        run += 1;
      } else {
        if (run > 0) {
          groups.push(run);
          run = 0;
        }
        cursor += block.durationMinutes;
      }
    }
    if (run > 0) groups.push(run);
    finishTime = minutesToTime(cursor);
  }

  return {
    periods,
    periodsPerDay: periods.length,
    finishTime,
    groups,
    errors,
    valid: errors.length === 0,
  };
}

// ---------------------------------------------------------------------------
// Derived value mapping
// ---------------------------------------------------------------------------

export interface NormalizedDerivedDay {
  day: DayOfWeek | string;
  source: string;
  periodsPerDay: number;
  startTime: string;
  finishTime: string;
  periods: IScheduleDerivedPeriod[];
  groups: number[];
  dailyTeachingCap: number;
}

export interface NormalizedSaturday {
  enabled: boolean;
  usedFallbackToWeekday: boolean;
  periodsPerDay: number;
  startTime: string;
  finishTime: string;
  periods: IScheduleDerivedPeriod[];
  groups: number[];
  /**
   * `derived.saturday` has no `dailyTeachingCap`; it is read from the `perDay`
   * entry whose day is `saturday`.
   */
  dailyTeachingCap: number | null;
}

export interface NormalizedDerived {
  periodsPerDay: number;
  periods: IScheduleDerivedPeriod[];
  finishTime: string;
  groups: number[];
  weeklySlotCount: number;
  enabledDays: string[];
  enabledDayCount: number;
  dailyTeachingCap: number;
  perDay: NormalizedDerivedDay[];
  saturday: NormalizedSaturday | null;
}

/**
 * Normalises `derived` for display. The only derived assumption left is that
 * Saturday's teaching cap is the `perDay` entry whose day is `saturday`.
 */
export function readDerived(
  raw: IScheduleDerived | null | undefined
): NormalizedDerived | null {
  if (!raw) return null;

  const perDay: NormalizedDerivedDay[] = raw.perDay.map((entry) => ({
    day: entry.day,
    source: entry.source,
    periodsPerDay: entry.periodsPerDay,
    startTime: entry.startTime,
    finishTime: entry.finishTime,
    periods: entry.periods,
    groups: entry.groups,
    dailyTeachingCap: entry.dailyTeachingCap,
  }));

  const saturday: NormalizedSaturday | null = raw.saturday
    ? {
        enabled: raw.saturday.enabled,
        usedFallbackToWeekday: raw.saturday.usedFallbackToWeekday,
        periodsPerDay: raw.saturday.periodsPerDay,
        startTime: raw.saturday.startTime,
        finishTime: raw.saturday.finishTime,
        periods: raw.saturday.periods,
        groups: raw.saturday.groups,
        dailyTeachingCap:
          perDay.find((d) => d.day === "saturday")?.dailyTeachingCap ?? null,
      }
    : null;

  return {
    periodsPerDay: raw.periodsPerDay,
    periods: raw.periods,
    finishTime: raw.finishTime,
    groups: raw.groups,
    weeklySlotCount: raw.weeklySlotCount,
    enabledDays: raw.enabledDays,
    enabledDayCount: raw.enabledDayCount,
    dailyTeachingCap: raw.dailyTeachingCap,
    perDay,
    saturday,
  };
}

// ---------------------------------------------------------------------------
// Requirement item normalisation
// ---------------------------------------------------------------------------

/** Row id used by DELETE /requirements/:id. */
export const getRequirementItemId = (
  item: IScheduleRequirementItem
): string => item.requirementId;

/** Subject id for PUT payloads. */
export const getRequirementSubjectId = (
  item: IScheduleRequirementItem
): string => item.subjectId;

/** Subject name returned by the backend, or "" when null. */
export const getRequirementSubjectName = (
  item: IScheduleRequirementItem
): string => item.subjectName ?? "";

/** Renders the `grade` object of the requirements response. */
export const requirementGradeLabel = (
  grade: { level?: string } | undefined | null
): string => grade?.level ?? "";

// ---------------------------------------------------------------------------
// Precheck guidance
// ---------------------------------------------------------------------------

/** Short, generic guidance: where each precheck code gets fixed. */
export const PRECHECK_GUIDANCE: Record<string, string> = {
  SETTINGS_MISSING:
    "Configure the school year's bell schedule and limits in the Settings tab.",
  SETTINGS_INVALID:
    "Fix the bell schedule or teacher limits in the Settings tab.",
  GRADE_OVER_SLOTS:
    "Reduce this grade's weekly periods in the Weekly Periods tab.",
  GRADE_UNDER_SLOTS:
    "Add subjects or increase weekly periods in the Weekly Periods tab.",
  GRADE_NO_REQUIREMENTS:
    "Set up the grade's weekly periods in the Weekly Periods tab.",
  SUBJECT_ASSIGNMENT_MISSING:
    "Assign a teacher to the section for this subject in Sections.",
  SUBJECT_ASSIGNMENT_DUPLICATE:
    "A subject has more than one teacher on a section; fix it in Sections.",
  TEACHER_OVER_CAPACITY:
    "Reduce this teacher's weekly periods or reassign some to another teacher.",
  DOUBLE_PERIOD_INVALID:
    "Adjust the double-period option or weekly periods in the Weekly Periods tab.",
  DOUBLE_PERIOD_INFEASIBLE:
    "There are not enough periods for a double period; reduce doubles or adjust the bell schedule.",
  SUBJECT_OVER_SLOTS:
    "Reduce this subject's weekly periods in the Weekly Periods tab.",
};

export const getPrecheckGuidance = (code: string): string | null =>
  PRECHECK_GUIDANCE[code] ?? null;

/** Label + order for the named precheck reference fields. */
const PRECHECK_REF_FIELDS: Array<[keyof IPrecheckRefs, string]> = [
  ["gradeName", "Grade"],
  ["sectionName", "Section"],
  ["subjectName", "Subject"],
  ["teacherName", "Teacher"],
  ["required", "Required"],
  ["available", "Available"],
  ["assignedPeriods", "Assigned periods"],
  ["capacity", "Capacity"],
  ["dailyCap", "Daily cap"],
  ["enabledDays", "Enabled days"],
  ["count", "Count"],
  ["occurrences", "Occurrences"],
];

/** Renders only the named precheck reference fields that are present. */
export const describePrecheckRefs = (
  refs: IPrecheckRefs | undefined | null
): string | null => {
  if (!refs || typeof refs !== "object") return null;
  const parts: string[] = [];
  for (const [key, label] of PRECHECK_REF_FIELDS) {
    const value = refs[key];
    if (value == null || value === "") continue;
    const rendered = Array.isArray(value) ? value.join(", ") : String(value);
    parts.push(`${label}: ${rendered}`);
  }
  return parts.length ? parts.join(" · ") : null;
};
