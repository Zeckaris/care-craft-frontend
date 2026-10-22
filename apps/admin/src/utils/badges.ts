import {
  BADGE_CRITERIA_TYPE_OPTIONS as SHARED_BADGE_CRITERIA_TYPE_OPTIONS,
  getBadgeCriteriaTypeLabel,
  getBadgeCriteriaTypeMeta,
  getBadgeScopeLabel,
} from '@carecraft/badges';
import type {
  BadgeEligibleGrade,
  BadgeScope,
  StudentBadgeSource,
} from '@carecraft/types';

export const BADGE_LEVEL_OPTIONS = [
  { value: 1, label: 'Level 1 (Bronze)' },
  { value: 2, label: 'Level 2 (Silver)' },
  { value: 3, label: 'Level 3 (Gold)' },
  { value: 4, label: 'Level 4 (Platinum)' },
];

export function getBadgeLevelLabel(level?: number | null): string {
  if (level === undefined || level === null) return '';
  return (
    BADGE_LEVEL_OPTIONS.find((option) => option.value === level)?.label ??
    `Level ${level}`
  );
}

export const BADGE_CRITERIA_TYPE_OPTIONS =
  SHARED_BADGE_CRITERIA_TYPE_OPTIONS;

export { getBadgeCriteriaTypeLabel, getBadgeCriteriaTypeMeta, getBadgeScopeLabel };

export const BADGE_SCOPE_OPTIONS: {
  value: BadgeScope;
  label: string;
}[] = [
  { value: 'term', label: 'Term' },
  { value: 'year', label: 'Year' },
];

export function getBadgeProgressScopeLabel(scope?: string | null): string {
  if (scope === 'term') return 'This term';
  if (scope === 'year') return 'This year';
  return '';
}

export const STUDENT_BADGE_SOURCE_OPTIONS: {
  value: StudentBadgeSource;
  label: string;
  color: string;
}[] = [
  { value: 'teacher', label: 'Teacher', color: 'blue' },
  { value: 'admin', label: 'Admin', color: 'purple' },
  { value: 'system', label: 'System', color: 'geekblue' },
];

export function getStudentBadgeSourceMeta(source?: string | null) {
  return (
    STUDENT_BADGE_SOURCE_OPTIONS.find((option) => option.value === source) ?? {
      value: source ?? 'system',
      label: source ?? 'System',
      color: 'default',
    }
  );
}

export function getGradeOptionLabel(grade: {
  level?: string | null;
  description?: string | null;
}): string {
  const level = String(grade.level ?? '').trim();
  const levelLabel = /^grade\b/i.test(level) ? level : `Grade ${level}`;
  const description = grade.description?.trim();
  return description ? `${levelLabel} (${description})` : levelLabel;
}

export function normalizeEligibleGradeIds(
  grades?: BadgeEligibleGrade[] | null,
): string[] {
  if (!Array.isArray(grades)) return [];
  return grades
    .map((grade) => (typeof grade === 'string' ? grade : grade?._id))
    .filter((grade): grade is string => Boolean(grade));
}

export function getEligibleGradeLabels(
  grades: BadgeEligibleGrade[] | null | undefined,
  labelById: Map<string, string>,
): string[] {
  if (!Array.isArray(grades)) return [];
  return grades.map((grade) => {
    if (typeof grade === 'string') {
      return labelById.get(grade) ?? grade;
    }
    if (!grade) return '';
    return labelById.get(grade._id) ?? getGradeOptionLabel(grade) ?? grade._id;
  });
}
