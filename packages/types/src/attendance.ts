/**
 * Attendance domain types.
 *
 * Mirrors the attendance backend contract:
 *   GET  /api/attendance/section/:sectionId/date/:date
 *   POST /api/attendance/section/:sectionId/date/:date
 *
 * The `date` is a plain `YYYY-MM-DD` string interpreted in the school's
 * timezone (Africa/Addis_Ababa). No time component is ever attached here.
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/** Status values accepted by the write endpoint. */
export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  'present',
  'absent',
  'late',
  'excused',
] as const;

/** A user reference, populated or as a bare id, depending on the endpoint. */
export type AttendanceActor =
  | string
  | {
      _id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  | null;

/** One student row in the section attendance roster. */
export interface AttendanceRosterRow {
  studentId: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  gender?: string | null;
  profileImage?: string | null;
  enrollmentId: string;
  status: AttendanceStatus | null;
  note?: string | null;
  markedBy?: AttendanceActor;
  attendanceId?: string | null;
  updatedAt: string | null;
}

export interface SectionAttendanceData {
  sectionId: string;
  date: string;
  total: number;
  marked: number;
  roster: AttendanceRosterRow[];
}

/** A single record sent to the write endpoint. */
export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  /**
   * The roster row's `updatedAt` for already-marked students, or `null` for
   * unmarked ones. Never omitted on the wire — the API treats omission as
   * last-write-wins.
   */
  expectedUpdatedAt?: string | null;
}

export type AttendanceAction =
  | 'created'
  | 'updated'
  | 'unchanged'
  | 'skipped'
  | 'conflict'
  | 'rejected';

/** The server's stored attendance record, returned on a conflict. */
export interface AttendanceStoredRecord {
  status: AttendanceStatus;
  note?: string | null;
  updatedAt: string;
  markedBy?: AttendanceActor;
}

export interface AttendanceResultItem {
  studentId: string;
  action: AttendanceAction;
  reason?: string;
  stored?: AttendanceStoredRecord;
}

export interface AttendanceSaveResponse {
  success: boolean;
  message?: string;
  data: {
    results: AttendanceResultItem[];
  };
}
