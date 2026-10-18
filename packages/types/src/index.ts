/**
 * @carecraft/types
 *
 * Shared entity interfaces used across all CareCraft apps.
 * This package must NOT import antd, react-router-dom, or any UI library.
 */

// ---------------------------------------------------------------------------
// Auth / User
// ---------------------------------------------------------------------------

/** Roles known to the platform. */
export type UserRole = 'admin' | 'coordinator' | 'teacher' | 'parent' | 'student';

/**
 * Lightweight user shape stored in context / returned by /auth/me.
 * Deliberately minimal; the full admin-user object is IUser below.
 */
export interface AuthUser {
  id: string;
  firstName: string;
  role: UserRole | string;
  email: string;
  mfaEnabled?: boolean;
}

// ---------------------------------------------------------------------------
// Admin User (teacher / parent / coordinator)
// ---------------------------------------------------------------------------

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole | string;
  phoneNumber?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isSuspended?: boolean;
}

export interface SearchUser {
  id: string;
  fullName: string;
  role: string;
  isSuspended: boolean;
}

// ---------------------------------------------------------------------------
// Academic structures
// ---------------------------------------------------------------------------

export interface IAcademicCalendar {
  _id: string;
  academicYear: string;
  startDate: string | Date;
  endDate: string | Date;
  isCurrent: boolean;
  registrationStartDate?: string | Date;
  registrationEndDate?: string | Date;
  newStudentRegistrationStartDate?: string | Date;
  newStudentRegistrationEndDate?: string | Date;
  holidayDates: Date[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IAcademicTerm {
  _id: string;
  name: string;
  calendarId: string;
  sequence?: number;
  startDate: string | Date;
  endDate: string | Date;
  isCurrent?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IGrade {
  _id: string;
  level: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubject {
  _id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Students / Enrollment
// ---------------------------------------------------------------------------

export interface IStudent {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  admissionDate: string;
  profileImage?: string;
  parentId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  } | null;
  enrollmentId?: {
    _id: string;
    gradeId: {
      _id: string;
      level: string;
    };
    schoolYear: string;
    isActive: boolean;
  } | null;
  createdAt?: string;
}

export interface IEnrollment {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    profileImage?: string;
    gender?: 'male' | 'female' | 'other';
  };
  gradeId: {
    _id: string;
    level: string;
  };
  sectionId: { _id: string; name: string } | null;
  schoolYear: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// School
// ---------------------------------------------------------------------------

export interface ISchoolInfo {
  _id?: string;
  name: string;
  motto?: string;
  establishedYear?: number;
  address: string;
  contactEmail: string;
  contactPhone: string;
  alternatePhone?: string;
  website?: string;
  logo?: string | null;
  theme: string;
  fontFamily: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  academicStructure?: 'Semester' | 'Term' | 'Quarter' | 'Trimester' | 'Custom';
  numberOfPeriods?: number;
  defaultPassingScore?: number;
  gradingSystem?: 'Percentage' | 'Letter (A-F)' | 'Grade Points (4.0)' | 'Custom';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Public/authenticated school branding returned by GET /general/school-info/branding.
 */
export interface BrandingInfo {
  name: string;
  logo?: string | null;
  theme: string;
  fontFamily: string;
}

// ---------------------------------------------------------------------------
// Assessments
// ---------------------------------------------------------------------------

export interface IAssessmentType {
  _id: string;
  name: string;
  weight: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAssessmentSetup {
  _id: string;
  name: string;
  description?: string | null;
  assessmentTypeIds: string[];
  createdAt?: string;
  updatedAt?: string;
  types?: Array<{
    _id: string;
    name: string;
    weight: number;
    description?: string | null;
  }>;
}

export interface IGSA {
  _id: string;
  gradeId: {
    _id: string;
    level: string;
    description?: string | null;
  };
  subjectId: {
    _id: string;
    name: string;
    description?: string | null;
  };
  assessmentSetupId: {
    _id: string;
    name: string;
    description?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Attribute / Observation
// ---------------------------------------------------------------------------

export interface IAttributeCategory {
  _id: string;
  name: string;
  description?: string;
  minScore: number;
  maxScore: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAttributeItem {
  attributeId: {
    _id: string;
    name: string;
    description?: string;
    minScore: number;
    maxScore: number;
  };
  score: number;
  comment?: string;
}

export interface IAttributeEvaluation {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  studentEnrollmentId: {
    _id: string;
    gradeId: {
      _id: string;
      level: string;
    };
    schoolYear: string;
    isActive: boolean;
  } | null;
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  attributes: IAttributeItem[];
  totalScore: number;
  remark?: string;
  createdAt: string;
}

export interface IObservation {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: {
    _id: string;
    name: string;
    minScore: number;
    maxScore: number;
  };
  score: number;
  description: string;
  date: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Action Plans
// ---------------------------------------------------------------------------

export interface IActionPlan {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  issue: string;
  goal: string;
  actionSteps: {
    _id?: string;
    step: string;
    completed: boolean;
    responsibleParty: 'teacher' | 'parent' | 'either';
  }[];
  progressRating?: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  __v?: number;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export interface IBadgeDefinition {
  _id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  criteria: {
    _id: string;
    type: string;
    attributeCategoryId?: string | null;
    minScore?: number | null;
    actionPlanId?: string | null;
    minProgress?: number | null;
    minObservations?: number | null;
    scope?: string | null;
    description?: string;
  }[];
  createdAt: string;
}

export interface IBadgeCriteria {
  _id: string;
  badgeDefinitionId: string;
  type: 'scoreThreshold' | 'actionPlanProgress' | 'observationCount' | 'custom' | 'attributeEvaluationAverage';
  attributeCategoryId?: string | null;
  minScore?: number | null;
  actionPlanId?: string | null;
  minProgress?: number | null;
  minObservations?: number | null;
  scope?: 'yearly' | 'allTime' | null;
  description?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Broadcasts / Notifications
// ---------------------------------------------------------------------------

export interface IBroadcastMessage {
  _id: string;
  title: string;
  body: string;
  recipients: string[];
  status: 'draft' | 'sent';
  sentBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  sentAt: string | null;
  priority: 'urgent' | 'normal' | 'low';
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  title?: string;
  message: string;
  isRead: boolean;
  broadcastId?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface EnrollmentTrendItem {
  grade: string;
  '2023'?: number;
  '2024'?: number;
  '2025'?: number;
  [key: string]: string | number | undefined;
}

export interface DashboardActivity {
  id: string;
  action: string;
  entity: string;
  user: string;
  timestamp: string;
}

export interface DashboardStats {
  summary: {
    totalStudents: number;
    totalTeachers: number;
  };
  genderBreakdown: Array<{ name: 'M' | 'F'; value: number }>;
  enrollmentTrend: EnrollmentTrendItem[];
  recentActivities: DashboardActivity[];
}

// ---------------------------------------------------------------------------
// Legacy activity type (used by useRecentActivity mock + types/activity.ts)
// ---------------------------------------------------------------------------

export interface Activity {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  entity: string;
  target: string;
  user: string;
  timestamp: Date;
  path: string;
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export interface ISection {
  _id: string;
  name: string;
  schoolYear: string;
  isActive: boolean;
  gradeId: {
    _id: string;
    level: string;
    description?: string | null;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Section generation / student assignment
// ---------------------------------------------------------------------------

/** Body for POST /api/section/generate (one grade per call). */
export interface ISectionGenerationInput {
  gradeId: string;
  schoolYear: string;
  targetSize: number;
  minSize: number;
  maxSize: number;
}

/** A single planned section in a generation preview/result. */
export interface ISectionGenerationPlan {
  sectionId: string | null;
  name: string;
  size: number;
  isNew: boolean;
}

/** Envelope data returned by POST /api/section/generate (dry run or real run). */
export interface ISectionGenerationResult {
  dryRun: boolean;
  gradeId: string;
  schoolYear: string;
  totalStudents: number;
  targetSize: number;
  minSize: number;
  maxSize: number;
  sectionCount: number;
  sections: ISectionGenerationPlan[];
  createdSectionIds: string[];
  warning: string | null;
}

/** Active enrollment with no section, from GET /api/enrollment/unassigned. */
export interface IUnassignedEnrollment {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    profileImage?: string;
    gender?: 'male' | 'female' | 'other';
  };
  gradeId: {
    _id: string;
    level: string;
  };
  sectionId: null;
  schoolYear: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Enrollment shape returned by GET /api/section/:id/roster. */
export interface ISectionRosterEnrollment {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    profileImage?: string;
    gender?: 'male' | 'female' | 'other';
  };
  gradeId: {
    _id: string;
    level: string;
  };
  sectionId: {
    _id: string;
    name: string;
  } | null;
  schoolYear: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Data returned by GET /api/section/:id/roster. */
export interface ISectionRoster {
  section: ISection;
  enrollments: ISectionRosterEnrollment[];
}

/** Data returned by POST /api/enrollment/bulk-move-section. */
export interface IBulkMoveSectionResult {
  successCount: number;
  failedCount: number;
  total: number;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Teaching Assignments
// ---------------------------------------------------------------------------

export type TeachingRole = 'homeroom' | 'subject';

export interface ITeachingAssignment {
  _id: string;
  sectionId: {
    _id: string;
    name: string;
    schoolYear: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  role: TeachingRole;
  subjectId?: {
    _id: string;
    name: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export * from './attendance';
export * from './schedule';
