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

/** Computed lifecycle status shared by calendars and terms. */
export type AcademicStatus = 'upcoming' | 'current' | 'past';

/** Reference to a calendar when it is populated by the API. */
export interface IAcademicCalendarRef {
  _id: string;
  academicYear: string;
}

export interface IAcademicCalendar {
  _id: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string | null;
  registrationEndDate: string | null;
  newStudentRegistrationStartDate: string | null;
  newStudentRegistrationEndDate: string | null;
  holidayDates: string[];
  status: AcademicStatus;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAcademicTerm {
  _id: string;
  calendarId: string | IAcademicCalendarRef;
  name: string;
  sequence: number;
  startDate: string;
  endDate: string;
  status: AcademicStatus;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Phases returned by GET /calendar/current-context. */
export type AcademicContextPhase =
  | 'in-term'
  | 'between-terms'
  | 'before-first-term'
  | 'between-years'
  | 'none';

export interface ICurrentAcademicContext {
  today: string;
  phase: AcademicContextPhase;
  currentCalendar: IAcademicCalendar | null;
  currentTerm: IAcademicTerm | null;
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
  features?: SchoolFeatures;
  createdAt?: string;
  updatedAt?: string;
}

/** Optional school-level feature flags exposed to authenticated apps. */
export interface SchoolFeatures {
  attributeEvaluation: boolean;
  observations: boolean;
}

/**
 * Public/authenticated school branding returned by GET /general/school-info/branding.
 */
export interface BrandingInfo {
  name: string;
  logo?: string | null;
  theme: string;
  fontFamily: string;
  features?: SchoolFeatures;
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
  } | null;
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
  } | null;
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
  } | null;
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  subjectId: {
    _id: string;
    name: string;
  } | null;
  description: string;
  date: string;
  schoolYear: string;
  term: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export interface BadgeUserRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface BadgeGradeRef {
  _id: string;
  level: string;
  description?: string | null;
}

/** Eligible grades are returned as IDs in list responses and populated in GET /:id. */
export type BadgeEligibleGrade = string | BadgeGradeRef;

export type BadgeScope = 'term' | 'year';

export type BadgeStreakMode = 'noAbsence' | 'onTime';

export type BadgeCriteriaType =
  | 'attributeAverage'
  | 'attendanceRate'
  | 'attendanceStreak'
  | 'academicAverage'
  | 'academicImprovement'
  | 'academicConsistency';

export interface BadgeCriteriaBase {
  _id: string;
  badgeDefinitionId: string;
  type: BadgeCriteriaType;
  description?: string | null;
  createdAt?: string;
  /** Legacy phase-1 field. It is never sent by the frontend. */
  minLockedWeightPercentage?: number | null;
}

export interface AttributeAverageBadgeCriteria extends BadgeCriteriaBase {
  type: 'attributeAverage';
  attributeCategoryId?: string | IAttributeCategory | null;
  minScore: number;
  minEvaluationCount: number;
  scope: BadgeScope;
}

export interface AttendanceRateBadgeCriteria extends BadgeCriteriaBase {
  type: 'attendanceRate';
  minPercentage: number;
  minRecordedSchoolDays: number;
  scope: BadgeScope;
}

export interface AttendanceStreakBadgeCriteria extends BadgeCriteriaBase {
  type: 'attendanceStreak';
  mode: BadgeStreakMode;
  minDays: number;
}

export interface AcademicAverageBadgeCriteria extends BadgeCriteriaBase {
  type: 'academicAverage';
  minPercentage: number;
  subjectId?: string | { _id: string; name: string } | null;
  scope: BadgeScope;
}

export interface AcademicImprovementBadgeCriteria extends BadgeCriteriaBase {
  type: 'academicImprovement';
  minPoints: number;
}

export interface AcademicConsistencyBadgeCriteria extends BadgeCriteriaBase {
  type: 'academicConsistency';
  minPercentage: number;
}

/** A badge criterion, discriminated by its `type`. */
export type BadgeCriteria =
  | AttributeAverageBadgeCriteria
  | AttendanceRateBadgeCriteria
  | AttendanceStreakBadgeCriteria
  | AcademicAverageBadgeCriteria
  | AcademicImprovementBadgeCriteria
  | AcademicConsistencyBadgeCriteria;

export interface AttributeAverageBadgeCriterionInput {
  type: 'attributeAverage';
  attributeCategoryId?: string | null;
  minScore: number;
  minEvaluationCount: number;
  scope: BadgeScope;
  description?: string;
}

export interface AttendanceRateBadgeCriterionInput {
  type: 'attendanceRate';
  minPercentage: number;
  minRecordedSchoolDays: number;
  scope: BadgeScope;
  description?: string;
}

export interface AttendanceStreakBadgeCriterionInput {
  type: 'attendanceStreak';
  mode: BadgeStreakMode;
  minDays: number;
  description?: string;
}

export interface AcademicAverageBadgeCriterionInput {
  type: 'academicAverage';
  minPercentage: number;
  subjectId?: string | null;
  scope: BadgeScope;
  description?: string;
}

export interface AcademicImprovementBadgeCriterionInput {
  type: 'academicImprovement';
  minPoints: number;
  description?: string;
}

export interface AcademicConsistencyBadgeCriterionInput {
  type: 'academicConsistency';
  minPercentage: number;
  description?: string;
}

/** Payload sent to POST /api/badgeCriteria and PUT /api/badgeCriteria/:id. */
export type BadgeCriterionInput =
  | AttributeAverageBadgeCriterionInput
  | AttendanceRateBadgeCriterionInput
  | AttendanceStreakBadgeCriterionInput
  | AcademicAverageBadgeCriterionInput
  | AcademicImprovementBadgeCriterionInput
  | AcademicConsistencyBadgeCriterionInput;

export type BadgeCriterionCreateInput = BadgeCriterionInput & {
  badgeDefinitionId: string;
};

export interface BadgeDefinition {
  _id: string;
  name: string;
  description: string;
  howToEarn?: string;
  icon?: string | null;
  level: number;
  eligibleGrades: BadgeEligibleGrade[];
  autoAward: boolean;
  criteria: BadgeCriteria[];
  createdBy?: BadgeUserRef | string | null;
  createdAt: string;
  updatedAt?: string;
}

export type StudentBadgeSource = 'teacher' | 'admin' | 'system';

export interface StudentBadgeTermRef {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface StudentBadgeStudentRef {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface StudentBadgeBadgeRef {
  _id: string;
  name: string;
  description?: string;
  howToEarn?: string;
  icon?: string | null;
  level: number;
  eligibleGrades?: BadgeEligibleGrade[];
  autoAward?: boolean;
}

/** An award of a badge to a student for one academic term. */
export interface StudentBadge {
  _id: string;
  badgeId: StudentBadgeBadgeRef | null;
  studentId: StudentBadgeStudentRef | null;
  schoolYear: string;
  academicTermId: StudentBadgeTermRef | string | null;
  source: StudentBadgeSource;
  awardedBy?: BadgeUserRef | null;
  note?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/** Unit of a progress value returned by GET /studentBadge/progress. */
export type BadgeProgressUnit =
  | 'score'
  | 'percent'
  | 'points'
  | 'days'
  | 'manual';

export interface BadgeSubjectAverageProgress {
  subjectId: string;
  subjectName: string;
  average: number | null;
  met: boolean;
}

/**
 * Counts and context that explain a progress criterion. The populated keys
 * depend on the criterion type.
 */
export interface BadgeProgressDetails {
  evaluationCount?: number;
  requiredEvaluationCount?: number;
  recordedSchoolDays?: number;
  requiredRecordedSchoolDays?: number;
  presentCount?: number;
  lateCount?: number;
  excusedCount?: number;
  absentCount?: number;
  mode?: BadgeStreakMode;
  recordedDays?: number;
  bestStreak?: number;
  currentStreak?: number;
  target?: number;
  subjectId?: string | null;
  subjectName?: string | null;
  subjectHasSetup?: boolean;
  fullyLocked?: boolean;
  waitingForAssessments?: boolean;
  lockedShare?: number | null;
  lockedWeightPercentage?: number;
  lockedStageCount?: number;
  requiredStageCount?: number;
  notApplicable?: boolean;
  reason?: string;
  currentTermId?: string;
  currentTermName?: string;
  currentTermAverage?: number | null;
  previousTermId?: string | null;
  previousTermName?: string;
  previousTermAverage?: number | null;
  changePoints?: number | null;
  currentTermFullyLocked?: boolean;
  previousTermFullyLocked?: boolean;
  currentTermLockedShare?: number;
  previousTermLockedShare?: number;
  subjectCount?: number;
  lowestSubjectId?: string | null;
  lowestSubjectName?: string;
  lowestSubjectAverage?: number | null;
  subjectAverages?: BadgeSubjectAverageProgress[];
  unsupported?: boolean;
}

export interface StudentBadgeProgressCriterion {
  criterionId: string;
  type: BadgeCriteriaType;
  scope: BadgeScope | null;
  current: number | null;
  target: number | null;
  unit: BadgeProgressUnit;
  enoughData: boolean;
  met: boolean;
  notApplicable?: boolean;
  waitingForAssessments?: boolean;
  lockedShare?: number | null;
  details: BadgeProgressDetails;
}

export interface StudentBadgeProgressBadge {
  _id: string;
  name: string;
  description: string;
  howToEarn?: string;
  icon?: string | null;
  level: number;
  autoAward: boolean;
}

export interface StudentBadgeProgressItem {
  badge: StudentBadgeProgressBadge;
  earned: boolean;
  awardId: string | null;
  awardedAt: string | null;
  source: StudentBadgeSource | null;
  criteria: StudentBadgeProgressCriterion[];
  allMet: boolean;
}

export interface StudentBadgeProgressTerm {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface StudentBadgeProgress {
  studentId: string;
  schoolYear: string;
  academicTerm: StudentBadgeProgressTerm;
  badges: StudentBadgeProgressItem[];
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

export type NotificationPriority = 'urgent' | 'normal' | 'low';

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  title?: string;
  message: string;
  isRead: boolean;
  priority?: NotificationPriority;
  broadcastId?: string;
  createdAt: string;
}

export interface INotificationPagination {
  total: number;
  page: number;
  limit: number;
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

// ---------------------------------------------------------------------------
// Grades / assessment
// ---------------------------------------------------------------------------

export * from './grades';
