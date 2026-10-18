import type {
  IGenerationJobProgress,
  IScheduleSettingsSnapshot,
  IScheduleUnplacedItem,
  DriftEntryReason,
  DriftLessonReason,
  IBellSchedule,
  UnplacedReasonCode,
} from '@carecraft/types';
import {
  ALL_DAYS,
  computeSchedule,
  formatTime12Hour,
  minutesToTime,
  parseTimeToMinutes,
  type ComputeOptions,
} from './scheduleUtils';

// ---------------------------------------------------------------------------
// Bell schedule rows (grid axis)
// ---------------------------------------------------------------------------

export interface DayRow {
  key: string;
  kind: 'period' | 'break';
  /** 1-based period number; only present for period rows. */
  period?: number;
  /** Break label; only present for break rows. */
  label?: string;
  /** 24-hour `HH:mm`. */
  start: string;
  /** 24-hour `HH:mm`. */
  end: string;
}

const WEEKDAY_COMPUTE: ComputeOptions = { minPeriods: 5, maxPeriods: 8 };
const SATURDAY_COMPUTE: ComputeOptions = { minPeriods: 1, maxPeriods: 8 };

/**
 * Expands a bell schedule into ordered grid rows: one row per period and one
 * labelled row per break. Period times come from the shared client-side
 * `computeSchedule` helper, so the grid matches the Settings preview exactly.
 */
export function buildDayRows(
  schedule: IBellSchedule | null | undefined,
  options: ComputeOptions = WEEKDAY_COMPUTE
): DayRow[] {
  if (!schedule || !Array.isArray(schedule.blocks)) return [];

  const computed = computeSchedule(schedule, options);
  const startMinutes = parseTimeToMinutes(schedule.startTime ?? '');
  if (startMinutes === null) return [];

  const rows: DayRow[] = [];
  let cursor = startMinutes;
  let periodNumber = 0;

  schedule.blocks.forEach((block, index) => {
    const from = cursor;
    const to = cursor + block.durationMinutes;

    if (block.type === 'period') {
      periodNumber += 1;
      const derived = computed.periods[periodNumber - 1];
      rows.push({
        key: `period-${periodNumber}`,
        kind: 'period',
        period: periodNumber,
        start: derived?.start ?? minutesToTime(from),
        end: derived?.end ?? minutesToTime(to),
      });
    } else {
      rows.push({
        key: `break-${index}-${from}`,
        kind: 'break',
        label: block.label?.trim() || 'Break',
        start: minutesToTime(from),
        end: minutesToTime(to),
      });
    }

    cursor = to;
  });

  return rows;
}

/** Enabled days in Monday→Saturday order. */
export function orderedEnabledDays(snapshot: IScheduleSettingsSnapshot): string[] {
  const enabled = new Set(snapshot.enabledDays ?? []);
  return ALL_DAYS.filter((day) => enabled.has(day));
}

/**
 * True when Saturday is enabled and carries its own bell schedule that differs
 * from the weekday schedule (different start time, blocks or block count). When
 * false, Saturday uses the weekday schedule and stays in the single grid.
 */
export function saturdayUsesOwnGrid(
  snapshot: IScheduleSettingsSnapshot
): boolean {
  if (!snapshot.enabledDays?.includes('saturday')) return false;

  const saturday = snapshot.saturdayBellSchedule;
  if (!saturday) return false;

  const weekday = snapshot.bellSchedule;
  if (saturday.startTime !== weekday.startTime) return true;

  const saturdayBlocks = saturday.blocks ?? [];
  const weekdayBlocks = weekday.blocks ?? [];
  if (saturdayBlocks.length !== weekdayBlocks.length) return true;

  return saturdayBlocks.some((block, index) => {
    const other = weekdayBlocks[index];
    return (
      !other ||
      block.type !== other.type ||
      block.durationMinutes !== other.durationMinutes
    );
  });
}

/** Day columns for the main (weekday) grid. Saturday is excluded when it has its own grid. */
export function weekdayGridDays(
  snapshot: IScheduleSettingsSnapshot
): string[] {
  const own = saturdayUsesOwnGrid(snapshot);
  return orderedEnabledDays(snapshot).filter(
    (day) => day !== 'saturday' || !own
  );
}

/** Day columns for the separate Saturday grid (empty when Saturday shares the weekday grid). */
export function saturdayGridDays(
  snapshot: IScheduleSettingsSnapshot
): string[] {
  return saturdayUsesOwnGrid(snapshot) ? ['saturday'] : [];
}

/** Bell schedule used for a day column: Saturday's own when present, else the weekday one. */
export function bellScheduleForDay(
  snapshot: IScheduleSettingsSnapshot,
  day: string
): IBellSchedule {
  if (day === 'saturday' && snapshot.saturdayBellSchedule) {
    return snapshot.saturdayBellSchedule;
  }
  return snapshot.bellSchedule;
}

/** Number of periods on a Saturday column (0 when Saturday is not enabled). */
export function saturdayPeriodCount(
  snapshot: IScheduleSettingsSnapshot
): number {
  if (!snapshot.enabledDays?.includes('saturday')) return 0;
  const schedule = snapshot.saturdayBellSchedule ?? snapshot.bellSchedule;
  return computeSchedule(schedule, SATURDAY_COMPUTE).periodsPerDay;
}

/** Weekly teaching slots = periods each enabled day (Saturday may differ). */
export function weeklySlotCount(snapshot: IScheduleSettingsSnapshot): number {
  const weekdayPeriods = computeSchedule(
    snapshot.bellSchedule,
    WEEKDAY_COMPUTE
  ).periodsPerDay;
  const saturdayPeriods = saturdayPeriodCount(snapshot);

  return (snapshot.enabledDays ?? []).reduce((total, day) => {
    if (day === 'saturday') return total + saturdayPeriods;
    return total + weekdayPeriods;
  }, 0);
}

/** `"8:30 AM to 9:20 AM"` for a row. */
export const formatRowTime = (row: DayRow): string =>
  `${formatTime12Hour(row.start)} to ${formatTime12Hour(row.end)}`;

// ---------------------------------------------------------------------------
// Unplaced lessons
// ---------------------------------------------------------------------------

export const UNPLACED_REASON_LABELS: Record<string, string> = {
  NO_FEASIBLE_SLOT:
    'No free slot for this lesson anywhere in the week.',
  NO_DOUBLE_BLOCK:
    'No pair of consecutive periods was free for a double period.',
  NO_FREE_SECTION_SLOT:
    'The section is already busy in every remaining slot.',
  TEACHER_CAP_REACHED:
    "The teacher's weekly taught-period limit is full.",
  SUBJECT_DAY_LIMIT:
    'The subject already runs the maximum number of times that day.',
  MANUALLY_UNPLACED: 'Was set aside by hand.',
  REMOVED: 'The lesson or its requirement was removed.',
};

export const describeUnplacedReason = (
  reason: UnplacedReasonCode | string
): string => UNPLACED_REASON_LABELS[reason] ?? 'Could not be placed.';

/** Plain-language summary combining all reasons an item reports. */
export const describeUnplacedReasons = (
  item: IScheduleUnplacedItem
): string => {
  const codes = item.reasons?.length ? item.reasons : [item.reason];
  return codes.map((code) => describeUnplacedReason(code)).join(' ');
};

// ---------------------------------------------------------------------------
// Drift report
// ---------------------------------------------------------------------------

export const DRIFT_ENTRY_REASON_LABELS: Record<string, string> = {
  SECTION_INACTIVE: 'The section is no longer active.',
  SUBJECT_NO_LONGER_REQUIRED:
    'The subject is no longer required for this grade.',
  TEACHER_REASSIGNED: 'A different teacher is now assigned to this subject.',
  BELL_SCHEDULE_CHANGED: 'The bell schedule changed since this was generated.',
};

export const DRIFT_LESSON_REASON_LABELS: Record<string, string> = {
  WEEKLY_COUNT_EXCEEDED:
    'More periods are placed than the weekly requirement (this counts as drift).',
  WEEKLY_COUNT_SHORTFALL:
    'Fewer periods are placed than the weekly requirement (not drift on its own).',
};

export const describeDriftEntryReason = (
  reason: DriftEntryReason | string
): string => DRIFT_ENTRY_REASON_LABELS[reason] ?? String(reason);

export const describeDriftLessonReason = (
  reason: DriftLessonReason | string
): string => DRIFT_LESSON_REASON_LABELS[reason] ?? String(reason);

/** Labels for the drift roll-up counts, in display order. */
export const DRIFT_COUNT_FIELDS: Array<[string, string]> = [
  ['invalidEntries', 'Entries needing attention'],
  ['sectionInactive', 'Section inactive'],
  ['noLongerRequired', 'Subject no longer required'],
  ['teacherReassigned', 'Teacher reassigned'],
  ['bellChanged', 'Bell schedule changed'],
  ['doubleInvalid', 'Double period invalid'],
  ['weeklyCountMismatch', 'Weekly count mismatch'],
  ['weeklyCountExcess', 'Weekly count over'],
];

// ---------------------------------------------------------------------------
// Job / stats formatting
// ---------------------------------------------------------------------------

export const JOB_PHASE_LABELS: Record<string, string> = {
  queued: 'Queued',
  collecting: 'Collecting lessons',
  solving: 'Solving',
  validating: 'Validating',
  persisting: 'Saving',
  done: 'Done',
  failed: 'Failed',
};

export const phaseLabel = (
  progress: IGenerationJobProgress | null | undefined
): string => {
  if (!progress) return '';
  return JOB_PHASE_LABELS[progress.phase] ?? progress.phase;
};

/** Human-readable elapsed time, e.g. `"820 ms"`, `"1.4 s"`, `"2 min 05 s"`. */
export function formatElapsedMs(ms: number | null | undefined): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '-';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const totalSeconds = ms / 1000;
  if (totalSeconds < 60) return `${totalSeconds.toFixed(1)} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes} min ${String(seconds).padStart(2, '0')} s`;
}

/** Truncated seed for display; seeds can be very large numbers. */
export function formatSeed(seed: number | string | null | undefined): string {
  if (seed === null || seed === undefined || seed === '') return '-';
  const value = String(seed);
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}
