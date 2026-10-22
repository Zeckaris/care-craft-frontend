/**
 * My Schedule: pure helpers for the teacher self-view timetable.
 *
 * Everything here is UI-framework agnostic so the page and its components stay
 * presentational. The school-year resolution lives in one place
 * (`resolveSchoolYear`) so it can later be swapped for a backend-provided
 * default without touching the page.
 */
import type {
  IMyScheduleBreak,
  IMyScheduleDay,
  IMyScheduleEntry,
} from '@carecraft/types';

/** Lowercase full day names, indexed like `Date#getDay()` (Sunday = 0). */
export const WEEK_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

/** Week-order index (Monday = 1 … Saturday = 6, Sunday = 0). -1 if unknown. */
export function weekdayIndex(day: string): number {
  return (WEEK_DAYS as readonly string[]).indexOf(day.trim().toLowerCase());
}

/** Lowercase full day name for a date using the device's local clock. */
export function todayName(date: Date = new Date()): string {
  return WEEK_DAYS[date.getDay()];
}

/** "Mon" / "Tue" … label for a lowercase full day name. */
export function dayShortLabel(day: string): string {
  const short = day.trim().slice(0, 3).toLowerCase();
  return short.charAt(0).toUpperCase() + short.slice(1);
}

/**
 * Normalise a school year to the canonical `YYYY-YYYY` form. Older records may
 * hold the short form (`2024-25`) or slash-separated variants.
 */
export function normalizeSchoolYear(value: string): string {
  const raw = value.trim();
  const match = /^(\d{4})\s*[-/]\s*(\d{2,4})$/.exec(raw);
  if (!match) return raw;
  const start = match[1];
  const end = match[2].length === 2 ? start.slice(0, 2) + match[2] : match[2];
  return `${start}-${end}`;
}

/** Start year of a school year string, or null when it cannot be parsed. */
export function schoolYearStart(value: string): number | null {
  const match = value.trim().match(/^(\d{4})/);
  return match ? Number(match[1]) : null;
}

/**
 * Most recent school year among the teacher's sections, normalised to
 * `YYYY-YYYY`. Returns null when the teacher has no sections, in which case the
 * caller must not request a schedule at all.
 */
export function resolveSchoolYear(
  sections: ReadonlyArray<{ section: { schoolYear: string } }>,
): string | null {
  let best: string | null = null;
  let bestStart = -Infinity;

  for (const item of sections) {
    const value = item.section?.schoolYear;
    if (!value) continue;
    const normalized = normalizeSchoolYear(value);
    const start = schoolYearStart(normalized);
    if (start === null) continue;
    if (start > bestStart) {
      bestStart = start;
      best = normalized;
    }
  }

  return best;
}

/** Minutes since midnight for an `HH:mm` string; null when unparseable. */
export function minutesFromHHmm(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/** Minutes since midnight on the device's local clock. */
export function nowMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

// ---------------------------------------------------------------------------
// Entry grouping
// ---------------------------------------------------------------------------

/** A lesson as rendered: a single period or both halves of a double period. */
export interface LessonBlock {
  entry: IMyScheduleEntry;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  isDouble: boolean;
}

export interface DayBlocks {
  /** Blocks keyed by their first period. */
  byStartPeriod: Map<number, LessonBlock>;
  /** Every period number mapped to its block (double halves included). */
  blockByPeriod: Map<number, LessonBlock>;
  /** Period numbers that are the second half of a double (skip on render). */
  consumed: Set<number>;
  /** Number of distinct lessons (a double counts once). */
  count: number;
}

/** Group a day's entries, joining the two halves of a double period. */
export function buildDayBlocks(entries: IMyScheduleEntry[]): DayBlocks {
  const sorted = [...entries].sort((a, b) => a.period - b.period);
  const doubles = new Map<string, IMyScheduleEntry[]>();
  const singles: IMyScheduleEntry[] = [];

  for (const entry of sorted) {
    if (entry.doubleGroupId) {
      const group = doubles.get(entry.doubleGroupId) ?? [];
      group.push(entry);
      doubles.set(entry.doubleGroupId, group);
    } else {
      singles.push(entry);
    }
  }

  const byStartPeriod = new Map<number, LessonBlock>();
  const blockByPeriod = new Map<number, LessonBlock>();
  const consumed = new Set<number>();

  for (const group of doubles.values()) {
    const ordered = [...group].sort((a, b) => a.period - b.period);
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const block: LessonBlock = {
      entry: first,
      startPeriod: first.period,
      endPeriod: last.period,
      startTime: first.startTime,
      endTime: last.endTime,
      isDouble: ordered.length > 1,
    };
    byStartPeriod.set(first.period, block);
    for (let i = 0; i < ordered.length; i += 1) {
      blockByPeriod.set(ordered[i].period, block);
      if (i > 0) consumed.add(ordered[i].period);
    }
  }

  for (const entry of singles) {
    const block: LessonBlock = {
      entry,
      startPeriod: entry.period,
      endPeriod: entry.period,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isDouble: false,
    };
    byStartPeriod.set(entry.period, block);
    blockByPeriod.set(entry.period, block);
  }

  return { byStartPeriod, blockByPeriod, consumed, count: byStartPeriod.size };
}

// ---------------------------------------------------------------------------
// Timeline rows
// ---------------------------------------------------------------------------

export type TimelineRow =
  | { kind: 'lesson'; block: LessonBlock }
  | { kind: 'free'; period: number; startTime: string; endTime: string }
  | { kind: 'break'; detail: IMyScheduleBreak };

/**
 * Build the day's rows in chronological order. When the response carries no
 * timeline (fallback), render the raw entries as a plain period list.
 */
export function buildTimelineRows(
  day: IMyScheduleDay | null,
  entries: IMyScheduleEntry[],
  fallback: boolean,
): TimelineRow[] {
  if (fallback || !day) {
    return [...entries]
      .sort((a, b) => a.period - b.period)
      .map((entry) => ({
        kind: 'lesson' as const,
        block: {
          entry,
          startPeriod: entry.period,
          endPeriod: entry.period,
          startTime: entry.startTime,
          endTime: entry.endTime,
          isDouble: false,
        },
      }));
  }

  const { byStartPeriod, consumed } = buildDayBlocks(entries);
  const periods = [...day.periods].sort((a, b) => a.period - b.period);
  const rows: TimelineRow[] = [];

  for (const period of periods) {
    if (consumed.has(period.period)) continue;

    const block = byStartPeriod.get(period.period);
    if (block) {
      rows.push({ kind: 'lesson', block });
    } else {
      rows.push({
        kind: 'free',
        period: period.period,
        startTime: period.startTime,
        endTime: period.endTime,
      });
    }

    for (const detail of day.breaks.filter((b) => b.afterPeriod === period.period)) {
      rows.push({ kind: 'break', detail });
    }
  }

  return rows;
}

// ---------------------------------------------------------------------------
// "Now" state
// ---------------------------------------------------------------------------

export type NowKind = 'before' | 'lesson' | 'free' | 'break' | 'after';

export interface NowState {
  kind: NowKind;
  period: number | null;
  block: LessonBlock | null;
  break: IMyScheduleBreak | null;
  nextLesson: LessonBlock | null;
  /** Start time of the first period, for the "School starts at …" message. */
  firstStartTime: string | null;
}

/**
 * Resolve what is happening right now on the given day. `nowMin` is minutes
 * since midnight on the device's local clock.
 */
export function computeNowState(
  day: IMyScheduleDay,
  entries: IMyScheduleEntry[],
  nowMin: number,
): NowState {
  const { byStartPeriod, blockByPeriod } = buildDayBlocks(entries);
  const periods = [...day.periods].sort((a, b) => a.period - b.period);
  const blocks = [...byStartPeriod.values()].sort(
    (a, b) => a.startPeriod - b.startPeriod,
  );
  const firstPeriod = periods[0] ?? null;
  const lastPeriod = periods[periods.length - 1] ?? null;
  const firstStartTime = firstPeriod?.startTime ?? null;

  const nextLessonAfter = (exclusivePeriod: number): LessonBlock | null =>
    blocks.find((b) => b.startPeriod > exclusivePeriod) ?? null;

  const firstStart = firstPeriod ? minutesFromHHmm(firstPeriod.startTime) : null;
  const lastEnd = lastPeriod ? minutesFromHHmm(lastPeriod.endTime) : null;

  if (firstStart !== null && nowMin < firstStart) {
    return {
      kind: 'before',
      period: null,
      block: null,
      break: null,
      nextLesson: blocks[0] ?? null,
      firstStartTime,
    };
  }

  if (lastEnd !== null && nowMin >= lastEnd) {
    return {
      kind: 'after',
      period: null,
      block: null,
      break: null,
      nextLesson: null,
      firstStartTime,
    };
  }

  const activeBreak = day.breaks.find((b) => {
    const start = minutesFromHHmm(b.startTime);
    const end = minutesFromHHmm(b.endTime);
    return start !== null && end !== null && nowMin >= start && nowMin < end;
  });
  if (activeBreak) {
    return {
      kind: 'break',
      period: activeBreak.afterPeriod,
      block: null,
      break: activeBreak,
      nextLesson: nextLessonAfter(activeBreak.afterPeriod),
      firstStartTime,
    };
  }

  const activePeriod = periods.find((p) => {
    const start = minutesFromHHmm(p.startTime);
    const end = minutesFromHHmm(p.endTime);
    return start !== null && end !== null && nowMin >= start && nowMin < end;
  });
  if (activePeriod) {
    const block = blockByPeriod.get(activePeriod.period) ?? null;
    return {
      kind: block ? 'lesson' : 'free',
      period: activePeriod.period,
      block,
      break: null,
      nextLesson: nextLessonAfter(block ? block.endPeriod : activePeriod.period),
      firstStartTime,
    };
  }

  // Unexpected gap between periods: treat as a free period leading to the next.
  const upcoming = periods.find((p) => {
    const start = minutesFromHHmm(p.startTime);
    return start !== null && start > nowMin;
  });
  return {
    kind: 'free',
    period: upcoming?.period ?? lastPeriod?.period ?? null,
    block: null,
    break: null,
    nextLesson: nextLessonAfter((upcoming?.period ?? lastPeriod?.period ?? 1) - 1),
    firstStartTime,
  };
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** "1" → "Grade 1"; "KG" → "KG". */
export function gradeText(gradeLevel: string | number): string {
  const value = String(gradeLevel ?? '').trim();
  if (!value) return '';
  return /^\d+$/.test(value) ? `Grade ${value}` : value;
}

/**
 * Combined grade + section label, omitting the grade when the section name
 * already carries it.
 */
export function gradeSectionLabel(
  gradeLevel: string | number,
  sectionName: string,
): string {
  const grade = gradeText(gradeLevel);
  const name = (sectionName ?? '').trim();
  if (!name) return grade;

  const token = String(gradeLevel ?? '').trim();
  if (token && name.toLowerCase().includes(token.toLowerCase())) return name;
  if (grade && name.toLowerCase().includes(grade.toLowerCase())) return name;

  return grade ? `${grade} ${name}` : name;
}

/** The default day tab: today when enabled, otherwise the next school day. */
export function defaultDaySelection(
  days: string[],
  today: string,
): { day: string; note: string | null } {
  const ordered = [...days].sort((a, b) => weekdayIndex(a) - weekdayIndex(b));
  if (ordered.length === 0) return { day: '', note: null };

  if (ordered.includes(today)) return { day: today, note: null };

  const todayIdx = weekdayIndex(today);
  const next = ordered.find((d) => weekdayIndex(d) > todayIdx);
  if (next) {
    return { day: next, note: `No school today. Showing ${dayShortLabel(next)}.` };
  }

  return {
    day: ordered[0],
    note: `No school today. Showing next ${dayShortLabel(ordered[0])}.`,
  };
}
