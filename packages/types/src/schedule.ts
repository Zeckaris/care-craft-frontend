/**
 * @carecraft/types: Schedule (Phase 1)
 *
 * Shared types for the school-wide class schedule area. The backend contract
 * lives under `/api/schedule` and is only available to admins and coordinators.
 *
 * Phase 1 covers: schedule settings, weekly period requirements and the
 * readiness (precheck) report. Schedule generation and grids are later phases.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Days a schedule may run on. A subset of Monday to Saturday (lowercase names). */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/** A bell-schedule block is either a teaching period or a break. */
export type ScheduleBlockType = 'period' | 'break';

/** How double periods are treated for a subject requirement. */
export type DoublePeriodOption = 'none' | 'allowed' | 'required';

/** Status of a grade's weekly requirement total against the weekly slot count. */
export type RequirementStatus = 'under' | 'exact' | 'over' | null;

// ---------------------------------------------------------------------------
// Schedule settings
// ---------------------------------------------------------------------------

/** A single ordered block in a bell schedule. */
export interface IScheduleBlock {
  type: ScheduleBlockType;
  /** Whole minutes; always >= 1. */
  durationMinutes: number;
  label?: string | null;
}

/** A bell schedule: a start time plus an ordered list of blocks. */
export interface IBellSchedule {
  /** 24-hour `HH:mm`. */
  startTime: string;
  blocks: IScheduleBlock[];
}

/** A single period with its computed start and end times. */
export interface IScheduleDerivedPeriod {
  /** 0-based index. */
  index: number;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
}

/** A per-day entry in `derived.perDay`. */
export interface IScheduleDerivedDay {
  day: DayOfWeek | string;
  source: 'weekday' | 'saturday';
  /** Number of periods that day (read this, not `periods.length`). */
  periodsPerDay: number;
  startTime: string;
  finishTime: string;
  periods: IScheduleDerivedPeriod[];
  groups: number[];
  dailyTeachingCap: number;
}

/**
 * Saturday's derived information. `usedFallbackToWeekday` is true when
 * Saturday is enabled but no separate Saturday bell schedule was provided.
 * There is no `dailyTeachingCap` here; read it from the matching `perDay` entry.
 */
export interface IScheduleDerivedSaturday {
  enabled: boolean;
  usedFallbackToWeekday: boolean;
  periodsPerDay: number;
  startTime: string;
  finishTime: string;
  periods: IScheduleDerivedPeriod[];
  groups: number[];
}

/** Server-computed schedule values returned alongside settings. */
export interface IScheduleDerived {
  periodsPerDay: number;
  periods: IScheduleDerivedPeriod[];
  finishTime: string;
  /** Period counts between breaks, e.g. `[3, 2, 2]`. */
  groups: number[];
  weeklySlotCount: number;
  enabledDays: DayOfWeek[];
  enabledDayCount: number;
  dailyTeachingCap: number;
  perDay: IScheduleDerivedDay[];
  saturday: IScheduleDerivedSaturday | null;
}

/**
 * Stored schedule settings for one school year. This is the raw stored
 * document, so it carries server-only fields that must never be sent back in a
 * PUT (`_id`, `__v`, `createdAt`, `updatedAt`).
 */
export interface IScheduleSettings {
  _id?: string;
  __v?: number;
  schoolYear: string;
  enabledDays: DayOfWeek[];
  bellSchedule: IBellSchedule;
  saturdayBellSchedule?: IBellSchedule | null;
  minimumFreePeriodsPerDay: number;
  maximumWeeklyTaughtPeriods?: number | null;
  maximumConsecutivePeriods?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Response data for GET /api/schedule/settings. */
export interface IScheduleSettingsData {
  settings: IScheduleSettings | null;
  derived: IScheduleDerived | null;
}

/** Body for PUT /api/schedule/settings. */
export interface IScheduleSettingsPayload {
  schoolYear: string;
  enabledDays?: DayOfWeek[];
  bellSchedule: IBellSchedule;
  saturdayBellSchedule?: IBellSchedule | null;
  minimumFreePeriodsPerDay?: number;
  maximumWeeklyTaughtPeriods?: number | null;
  maximumConsecutivePeriods?: number | null;
}

// ---------------------------------------------------------------------------
// Weekly period requirements
// ---------------------------------------------------------------------------

/** One subject requirement row returned by GET /requirements. */
export interface IScheduleRequirementItem {
  /** Row id used by DELETE /requirements/:id. */
  requirementId: string;
  subjectId: string;
  subjectName: string | null;
  periodsPerWeek: number;
  doublePeriod: DoublePeriodOption;
  runningTotal: number;
}

/** Subject requirement input for PUT /requirements. */
export interface IScheduleRequirementInputItem {
  subjectId: string;
  periodsPerWeek: number;
  doublePeriod?: DoublePeriodOption;
}

/** Response data for GET /api/schedule/requirements. */
export interface IScheduleRequirementsData {
  schoolYear: string;
  gradeId: string;
  grade: { _id: string; level: string; description?: string | null };
  weeklySlotCount: number;
  items: IScheduleRequirementItem[];
  totalPeriods: number;
  remainingPeriods: number;
  status: RequirementStatus;
}

/** Body for PUT /api/schedule/requirements. */
export interface IScheduleRequirementsPayload {
  schoolYear: string;
  gradeId: string;
  items: IScheduleRequirementInputItem[];
}

/** Body for POST /api/schedule/requirements/copy. */
export interface IScheduleRequirementsCopyPayload {
  schoolYear: string;
  fromGradeId: string;
  toGradeId: string;
  overwrite?: boolean;
}

/** Result data for POST /api/schedule/requirements/copy. */
export interface IScheduleRequirementsCopyResult {
  schoolYear: string;
  fromGradeId: string;
  toGradeId: string;
  overwrite: boolean;
  copied: number;
  overwritten: number;
  skipped: number;
  totalTargetAfter: number;
}

// ---------------------------------------------------------------------------
// Readiness (precheck)
// ---------------------------------------------------------------------------

/** Stable precheck issue codes. */
export type SchedulePrecheckCode =
  | 'SETTINGS_MISSING'
  | 'SETTINGS_INVALID'
  | 'GRADE_OVER_SLOTS'
  | 'GRADE_UNDER_SLOTS'
  | 'GRADE_NO_REQUIREMENTS'
  | 'SUBJECT_ASSIGNMENT_MISSING'
  | 'SUBJECT_ASSIGNMENT_DUPLICATE'
  | 'TEACHER_OVER_CAPACITY'
  | 'DOUBLE_PERIOD_INVALID'
  | 'DOUBLE_PERIOD_INFEASIBLE'
  | 'SUBJECT_OVER_SLOTS'
  | (string & {});

/**
 * Named structured references a precheck issue may carry. Fields are optional;
 * only the ones present are shown.
 */
export interface IPrecheckRefs {
  gradeName?: string;
  sectionName?: string;
  subjectName?: string;
  teacherName?: string;
  required?: number;
  available?: number;
  assignedPeriods?: number;
  capacity?: number;
  dailyCap?: number;
  enabledDays?: string[] | number;
  count?: number;
  occurrences?: number;
}

/** A single precheck finding. `message` is the primary display text. */
export interface IPrecheckIssue {
  code: SchedulePrecheckCode;
  severity: string;
  message: string;
  refs?: IPrecheckRefs;
}

/** Aggregate precheck summary. */
export interface IPrecheckSummary {
  sections: number;
  teachers: number;
  totalLessonsToPlace: number;
  totalSlots: number;
  weeklySlotsPerSection: number;
}

/** Response data for GET /api/schedule/precheck. */
export interface IPrecheckResult {
  ok: boolean;
  errors: IPrecheckIssue[];
  warnings: IPrecheckIssue[];
  summary: IPrecheckSummary;
}

// ---------------------------------------------------------------------------
// Generation (Phase 2)
// ---------------------------------------------------------------------------

/** Lifecycle status of a stored schedule. */
export type ScheduleStatus = 'draft' | 'published' | 'archived';

/** Lifecycle status of a generation job. */
export type GenerationJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** Coarse phase reported while a generation job runs. */
export type GenerationPhase =
  | 'queued'
  | 'collecting'
  | 'solving'
  | 'validating'
  | 'persisting'
  | 'done'
  | 'failed';

/** Stable failure codes a generation job may report. */
export type GenerationErrorCode =
  | 'PRECHECK_FAILED'
  | 'VALIDATION_FAILED'
  | 'DRAFT_CONFLICT'
  | 'STALE_JOB'
  | 'GENERATION_ERROR'
  | (string & {});

/** Stable codes explaining why a lesson could not be placed. */
export type UnplacedReasonCode =
  | 'NO_FEASIBLE_SLOT'
  | 'NO_DOUBLE_BLOCK'
  | 'NO_FREE_SECTION_SLOT'
  | 'TEACHER_CAP_REACHED'
  | 'SUBJECT_DAY_LIMIT'
  | 'MANUALLY_UNPLACED'
  | 'REMOVED'
  | (string & {});

/** Soft-constraint score breakdown. Values are the solver's own units. */
export interface IScheduleSoftBreakdown {
  spreadSubjectAcrossWeek: number;
  varyPeriodPosition: number;
  teacherIdleGaps: number;
  teacherLoadBalance: number;
  teacherRunLength: number;
}

/** Solver statistics stored with a generated schedule. */
export interface IScheduleStats {
  seed: number | string | null;
  restarts: number;
  iterations: number;
  elapsedMs: number;
  timedOut: boolean;
  hardViolations: number;
  softScore: number;
  softBreakdown: IScheduleSoftBreakdown;
  unplacedCount: number;
}

/** Snapshot of the settings used when a schedule was generated. */
export interface IScheduleSettingsSnapshot {
  schoolYear: string;
  enabledDays: DayOfWeek[];
  bellSchedule: IBellSchedule;
  saturdayBellSchedule: IBellSchedule | null;
  minimumFreePeriodsPerDay: number;
  maximumWeeklyTaughtPeriods: number | null;
  maximumConsecutivePeriods: number | null;
}

/** A lesson that could not be placed. Carries ids only. */
export interface IScheduleUnplacedItem {
  lessonId: string;
  sectionId: string;
  gradeId: string;
  subjectId: string;
  teacherId: string;
  periods: number;
  reason: UnplacedReasonCode;
  reasons?: string[];
}

/** A placed lesson (one period of a lesson on one day). */
export interface IScheduleEntry {
  entryId: string;
  sectionId: string;
  sectionName: string;
  gradeId: string;
  gradeLevel: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  /** Lowercase full day name, e.g. `"monday"`. */
  day: DayOfWeek | (string & {});
  /** 1-based period number. */
  period: number;
  /** 24-hour `HH:mm`. */
  startTime: string;
  /** 24-hour `HH:mm`. */
  endTime: string;
  /** Shared by the two entries of a double period. */
  doubleGroupId: string | null;
  locked: boolean;
}

/** A stored schedule header (list items carry no `entries`). */
export interface ISchedule {
  scheduleId: string;
  schoolYear: string;
  status: ScheduleStatus;
  fingerprint: string;
  /** `null` means drift is unknown / not computed. */
  drifted: boolean | null;
  entryCount: number;
  version: number;
  stats: IScheduleStats;
  unplaced: IScheduleUnplacedItem[];
  settingsSnapshot: IScheduleSettingsSnapshot;
  publishedAt: string | null;
  publishedBy: string | null;
  allowUnplacedOverride: boolean;
  clonedFrom: string | null;
  generatedBy: string | null;
  generatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Response data for GET /draft, GET /published and GET /schedules/:id. */
export interface IScheduleWithEntries {
  schedule: ISchedule;
  entries: IScheduleEntry[];
}

/** Progress reported while a generation job runs. */
export interface IGenerationJobProgress {
  phase: GenerationPhase;
  percent: number;
  message: string;
}

/** Data returned when a generation job completes. */
export interface IGenerationJobResult {
  scheduleId: string;
  entryCount: number;
  unplacedCount: number;
  stats: IScheduleStats;
  droppedLocked: string[];
}

/** Failure payload a generation job may report. */
export interface IGenerationJobError {
  message: string;
  code: GenerationErrorCode;
}

/** Response data for GET /api/schedule/generation-jobs/:id. */
export interface IGenerationJob {
  jobId: string;
  schoolYear: string;
  status: GenerationJobStatus;
  progress: IGenerationJobProgress;
  precheck?: IPrecheckResult | null;
  result?: IGenerationJobResult | null;
  error?: IGenerationJobError | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt?: string;
}

/** 202 response data for POST /api/schedule/generate. */
export interface IGenerateScheduleStart {
  jobId: string;
  schoolYear: string;
  status: GenerationJobStatus;
  precheck: IPrecheckResult;
}

/** Body for POST /api/schedule/generate. */
export interface IGenerateSchedulePayload {
  schoolYear: string;
  seed?: number;
  iterationBudget?: number;
  timeBudgetMs?: number;
  replaceExistingDraft?: boolean;
  keepLocked?: boolean;
}

/** 409 error data when a generation is already running. */
export interface IGenerationRunningConflict {
  jobId: string;
  status: GenerationJobStatus;
}

/** 409 error data when a draft already exists. */
export interface IDraftConflict {
  scheduleId: string;
}

/** Response data for DELETE /api/schedule/schedules/:id. */
export interface IDiscardScheduleResult {
  scheduleId: string;
  deletedEntries: number;
}

// ---------------------------------------------------------------------------
// Publishing (Phase 3)
// ---------------------------------------------------------------------------

/** Body for POST /api/schedule/schedules/:id/publish. */
export interface IPublishSchedulePayload {
  /** Required when unplaced lessons remain and the draft is to be published anyway. */
  allowUnplaced?: boolean;
}

/** Response data for a successful publish (200). */
export interface IPublishScheduleResult {
  scheduleId: string;
  status: 'published';
  publishedAt: string;
  allowUnplacedOverride: boolean;
  unplacedCount: number;
  /** Ids of previously published schedules that were archived by this publish. */
  archivedPrevious: string[];
}

/**
 * A hard-rule violation reported when publishing is blocked. Beyond `rule` and
 * `message` the backend may attach named refs (grade, section, subject, teacher,
 * day, period).
 */
export interface IScheduleViolation {
  rule: string;
  message: string;
  gradeName?: string;
  sectionName?: string;
  subjectName?: string;
  teacherName?: string;
  day?: string;
  period?: number;
  [key: string]: unknown;
}

/** 409 error data variants returned by POST /publish (discriminated by keys). */
export interface IPublishNotDraftConflict {
  scheduleId: string;
  status: ScheduleStatus;
}
export interface IPublishPrecheckConflict {
  precheck: IPrecheckResult;
}
export interface IPublishViolationsConflict {
  violations: IScheduleViolation[];
}
export interface IPublishDriftConflict {
  drift: IScheduleDriftReport;
}
export interface IPublishUnplacedConflict {
  unplacedCount: number;
  unplaced: IScheduleUnplacedItem[];
}
export interface IPublishRaceConflict {
  scheduleId: string;
}

// ---------------------------------------------------------------------------
// Cloning (Phase 3)
// ---------------------------------------------------------------------------

/** Body for POST /api/schedule/schedules/:id/clone. */
export interface ICloneSchedulePayload {
  replaceExistingDraft?: boolean;
}

/** Response data for a successful clone (201). */
export interface ICloneScheduleResult {
  scheduleId: string;
  schoolYear: string;
  status: 'draft';
  entryCount: number;
  clonedFrom: string;
  version: number;
}

/** 409 error data when a draft already exists; retry with replaceExistingDraft. */
export interface ICloneDraftConflict {
  scheduleId: string;
}

// ---------------------------------------------------------------------------
// Drift report (Phase 3)
// ---------------------------------------------------------------------------

/** Reasons an individual entry is flagged by the drift report. */
export type DriftEntryReason =
  | 'SECTION_INACTIVE'
  | 'SUBJECT_NO_LONGER_REQUIRED'
  | 'TEACHER_REASSIGNED'
  | 'BELL_SCHEDULE_CHANGED'
  | (string & {});

/**
 * Reasons a lesson's weekly count is flagged. `WEEKLY_COUNT_SHORTFALL` alone is
 * not counted as drift; only excess or underlying data changes are.
 */
export type DriftLessonReason =
  | 'WEEKLY_COUNT_EXCEEDED'
  | 'WEEKLY_COUNT_SHORTFALL'
  | (string & {});

/** Which parts of the stored settings no longer match the current settings. */
export interface IDriftSettingsDiff {
  changed: boolean;
  bellScheduleChanged: boolean;
  enabledDaysChanged: boolean;
}

/** Roll-up counts for the drift report. */
export interface IDriftCounts {
  invalidEntries: number;
  sectionInactive: number;
  noLongerRequired: number;
  teacherReassigned: number;
  bellChanged: number;
  doubleInvalid: number;
  weeklyCountMismatch: number;
  weeklyCountExcess: number;
}

/** A single entry flagged by the drift report. */
export interface IDriftEntry {
  entryId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  period: number;
  reasons: DriftEntryReason[];
}

/** A lesson whose weekly count is over or short. */
export interface IDriftLesson {
  lessonId: string;
  sectionId: string;
  subjectId: string;
  required: number;
  placed: number;
  reason: DriftLessonReason;
}

/** Response data for GET /api/schedule/schedules/:id/drift. */
export interface IScheduleDriftReport {
  scheduleId: string;
  schoolYear: string;
  status: ScheduleStatus;
  drifted: boolean;
  generatedFingerprint: string;
  currentFingerprint: string;
  settings: IDriftSettingsDiff;
  counts: IDriftCounts;
  entries: IDriftEntry[];
  lessons: IDriftLesson[];
}

// ---------------------------------------------------------------------------
// Teacher self-view: GET /api/schedule/my (Phase 4)
// ---------------------------------------------------------------------------

/** A single teaching period on a day's bell schedule. */
export interface IMySchedulePeriod {
  /** 1-based period number. */
  period: number;
  /** 24-hour `HH:mm`. */
  startTime: string;
  /** 24-hour `HH:mm`. */
  endTime: string;
}

/** A break between periods on a day's bell schedule. */
export interface IMyScheduleBreak {
  /** Period number preceding the break. */
  afterPeriod: number;
  /** 24-hour `HH:mm`. */
  startTime: string;
  /** 24-hour `HH:mm`. */
  endTime: string;
  durationMinutes: number;
  label: string | null;
}

/**
 * One day in the published schedule's timeline. `periods` and `breaks` are the
 * day's own bell schedule; Saturday may differ from weekdays.
 */
export interface IMyScheduleDay {
  /** Lowercase full day name, e.g. `"monday"`. */
  day: DayOfWeek | (string & {});
  source: 'weekday' | 'saturday';
  /** 24-hour `HH:mm`. */
  startTime: string;
  /** 24-hour `HH:mm`; end of the last period. */
  endTime: string;
  periods: IMySchedulePeriod[];
  breaks: IMyScheduleBreak[];
}

/** A placed lesson taught by the signed-in teacher. */
export interface IMyScheduleEntry {
  entryId: string;
  sectionId: string;
  sectionName: string;
  gradeId: string;
  /** May be a number (`1`) or text (`"KG"`). */
  gradeLevel: string | number;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  /** Lowercase full day name, e.g. `"monday"`. */
  day: DayOfWeek | (string & {});
  /** 1-based period number. */
  period: number;
  /** 24-hour `HH:mm`. */
  startTime: string;
  /** 24-hour `HH:mm`. */
  endTime: string;
  /** Shared by the two entries of a double period. */
  doubleGroupId: string | null;
  locked: boolean;
}

/** Response data for GET /api/schedule/my. */
export interface IMyScheduleData {
  scheduleId: string;
  schoolYear: string;
  publishedAt: string;
  teacherId: string;
  /** Number of placed lessons for the teacher. */
  count: number;
  /** Enabled school days in week order (lowercase full names). */
  days: string[];
  timeline: { days: IMyScheduleDay[] };
  entries: IMyScheduleEntry[];
}
