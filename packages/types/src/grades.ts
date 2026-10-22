/**
 * Grades / assessment domain types.
 *
 * Mirrors the assessment backend contract:
 *   GET  /api/term/current
 *   GET  /api/term
 *   GET  /api/assessment/scores/class-sheet
 *   GET  /api/assessment/scores/results
 *   POST /api/assessment/scores/write
 *   POST /api/assessment/scores/conduct
 *   POST /api/assessment/scores/complete
 *   POST /api/assessment/scores/reopen
 */

/** The calendar a term belongs to. `GET /term` only populates `_id` + `academicYear`. */
export interface TermCalendarRef {
  _id: string;
  academicYear: string;
  startDate?: string;
  endDate?: string;
}

/** A term, as returned by `GET /term/current` and `GET /term`. */
export interface AcademicTerm {
  _id: string;
  name: string;
  sequence?: number;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  calendarId: TermCalendarRef;
}

/** Conduct state of one assessment-type column. */
export type AssessmentStageState = 'not-conducted' | 'conducted' | 'locked';

/** The assessment setup backing a subject/grade (the sheet's column source). */
export interface AssessmentSetupRef {
  id: string;
  name: string;
}

/** One assessment-type column of the class sheet. `maxScore` equals `weight`. */
export interface ClassSheetColumn {
  typeId: string;
  name: string;
  weight: number;
  maxScore: number;
  order: number;
  state: AssessmentStageState;
}

/** One student's mark cell. `entered` is false when the stored mark is absent. */
export interface ClassSheetCell {
  score: number | null;
  entered: boolean;
}

/** One student row of the class sheet, sorted by last name then first name. */
export interface ClassSheetStudent {
  studentId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  scores: Record<string, ClassSheetCell>;
  total: number | null;
  average: number | null;
  /** The student's marksheet timestamp; null when no marksheet exists yet. */
  updatedAt: string | null;
}

/** Data returned by `GET /assessment/scores/class-sheet`. */
export interface ClassSheetData {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  schoolYear: string;
  setup: AssessmentSetupRef;
  hasConductedStages: boolean;
  columns: ClassSheetColumn[];
  students: ClassSheetStudent[];
}

/**
 * Data returned by `GET /assessment/scores/results`, the read-only class sheet
 * admins and coordinators open for any section + subject + term.
 *
 * Same shape as the teacher's class sheet plus `hasLockedStages`. Marks are only
 * populated for locked stages; a conducted-but-unlocked stage has `entered:false`
 * cells that mean "not visible yet" rather than zero.
 */
export interface AssessmentResultsData extends ClassSheetData {
  hasLockedStages: boolean;
}

/** The server's stored mark for a student, returned on a conflict. */
export interface MarkStoredRecord {
  score: number | null;
  updatedAt: string | null;
}

export type MarkAction =
  | 'created'
  | 'updated'
  | 'unchanged'
  | 'skipped'
  | 'conflict'
  | 'rejected';

/** One per-record outcome of `POST /assessment/scores/write`. */
export interface MarkResult {
  studentId: string;
  action: MarkAction;
  score?: number | null;
  updatedAt?: string | null;
  total?: number | null;
  average?: number | null;
  reason?: string;
  stored?: MarkStoredRecord | null;
}

/** Body of `POST /assessment/scores/write`. */
export interface MarksWriteInput {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  assessmentTypeId: string;
  records: Array<{ studentId: string; score: number; expectedUpdatedAt?: string | null }>;
}

/** Data returned by `POST /assessment/scores/write` (HTTP 200 even on failures). */
export interface MarksWriteData {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  assessmentTypeId: string;
  typeName: string;
  state: AssessmentStageState;
  results: MarkResult[];
}

/** Body of the conduct / complete stage actions. */
export interface StageActionInput {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  assessmentTypeId: string;
}

/** Data returned by `POST /assessment/scores/conduct` and `/complete`. */
export interface StageActionData {
  sectionId: string;
  subjectId: string;
  academicTermId: string;
  assessmentTypeId: string;
  typeName: string;
  state: AssessmentStageState;
  status: string;
  conductedStages: string[];
  lockedStages: string[];
  nextStage?: string | null;
}
