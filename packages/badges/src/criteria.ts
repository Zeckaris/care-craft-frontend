import type {
  BadgeCriteria,
  BadgeCriteriaType,
  BadgeCriterionInput,
  BadgeProgressUnit,
  BadgeScope,
  BadgeStreakMode,
  StudentBadgeProgressCriterion,
} from '@carecraft/types';

export interface BadgeCriteriaTypeMeta {
  value: BadgeCriteriaType;
  label: string;
  description: string;
  notes: string[];
}

export const BADGE_CRITERIA_TYPE_META: BadgeCriteriaTypeMeta[] = [
  {
    value: 'attributeAverage',
    label: 'Attribute average',
    description:
      'Average score across attribute evaluations in the selected period.',
    notes: [
      'Only evaluations in the selected period count.',
      'A minimum evaluation count prevents awards from a tiny sample.',
    ],
  },
  {
    value: 'attendanceRate',
    label: 'Attendance rate',
    description:
      'Share of recorded school days the student attended in the selected period.',
    notes: ['Excused absences count as absences for badges.'],
  },
  {
    value: 'attendanceStreak',
    label: 'Attendance streak',
    description:
      'Longest run of recorded school days without an absence, or without a late arrival and without an absence.',
    notes: [
      'Streaks restart each term.',
      'Only recorded school days count, so weekends and holidays never break a streak.',
      'Excused absences count as absences for badges.',
    ],
  },
  {
    value: 'academicAverage',
    label: 'Academic average',
    description:
      'Average across locked assessment stages for one subject or the overall average.',
    notes: [
      'Academic criteria are only checked after every assessment is locked.',
      'Year scope needs every term of the year locked.',
    ],
  },
  {
    value: 'academicImprovement',
    label: 'Academic improvement',
    description:
      'Percentage point gain compared with the previous term of the same year.',
    notes: [
      'Academic criteria are only checked after every assessment is locked.',
      'Not applicable when there is no previous term.',
    ],
  },
  {
    value: 'academicConsistency',
    label: 'Academic consistency',
    description:
      'Every subject average meets the minimum for the current term.',
    notes: [
      'Academic criteria are only checked after every assessment is locked.',
      'Every subject must be fully locked before this criterion is evaluated.',
    ],
  },
];

export const BADGE_CRITERIA_TYPE_OPTIONS = BADGE_CRITERIA_TYPE_META.map(
  (meta) => ({
    value: meta.value,
    label: meta.label,
    description: meta.description,
  }),
);

export const LEGACY_CRITERIA_LABEL = 'Legacy criterion';

export function isKnownBadgeCriteriaType(
  type: unknown,
): type is BadgeCriteriaType {
  return BADGE_CRITERIA_TYPE_META.some((meta) => meta.value === type);
}

export function getBadgeCriteriaTypeMeta(
  type?: string | null,
): BadgeCriteriaTypeMeta | null {
  if (!type) return null;
  return BADGE_CRITERIA_TYPE_META.find((meta) => meta.value === type) ?? null;
}

export function getBadgeCriteriaTypeLabel(type?: string | null): string {
  return getBadgeCriteriaTypeMeta(type)?.label ?? LEGACY_CRITERIA_LABEL;
}

export function getBadgeCriteriaTypeNotes(type?: string | null): string[] {
  return getBadgeCriteriaTypeMeta(type)?.notes ?? [];
}

export function getBadgeScopeLabel(scope?: BadgeScope | null): string {
  if (scope === 'term') return 'per term';
  if (scope === 'year') return 'per year';
  return '';
}

export function getBadgeProgressScopeLabel(scope?: BadgeScope | null): string {
  if (scope === 'term') return 'This term';
  if (scope === 'year') return 'This year';
  return '';
}

export function getBadgeStreakModeLabel(mode?: BadgeStreakMode | null): string {
  if (mode === 'onTime') return 'On time, no late arrival and no absence';
  if (mode === 'noAbsence') return 'No absence';
  return 'No absence';
}

type CriterionSummaryLike = BadgeCriteria | BadgeCriterionInput;

interface CriterionSummaryContext {
  attributeCategoryName?: string | null;
  subjectName?: string | null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return null;
}

function readNumber(value: unknown, fallback = 0): number {
  return toFiniteNumber(value) ?? fallback;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readScope(value: unknown): BadgeScope | null {
  return value === 'term' || value === 'year' ? value : null;
}

export function formatCriterionSummary(
  criterion: CriterionSummaryLike,
  context: CriterionSummaryContext = {},
): string {
  const type = readString((criterion as { type?: unknown }).type);

  switch (type) {
    case 'attributeAverage': {
      const minScore = readNumber((criterion as any).minScore);
      const minEvaluationCount = readNumber(
        (criterion as any).minEvaluationCount,
      );
      const scope = readScope((criterion as any).scope);
      const category = context.attributeCategoryName ?? null;
      const categoryText = category ? ` in ${category}` : ' across all categories';
      const scopeText = getBadgeScopeLabel(scope);
      return `Attribute average of at least ${minScore}${categoryText} across at least ${minEvaluationCount} evaluations${scopeText ? `, ${scopeText}` : ''}`;
    }
    case 'attendanceRate': {
      const minPercentage = readNumber((criterion as any).minPercentage);
      const minRecordedSchoolDays = readNumber(
        (criterion as any).minRecordedSchoolDays,
      );
      const scope = readScope((criterion as any).scope);
      const scopeText = getBadgeScopeLabel(scope);
      return `Attendance rate of at least ${minPercentage}% across at least ${minRecordedSchoolDays} recorded school days${scopeText ? `, ${scopeText}` : ''}`;
    }
    case 'attendanceStreak': {
      const mode = (criterion as any).mode as BadgeStreakMode | null;
      const minDays = readNumber((criterion as any).minDays);
      const modeText = mode === 'onTime' ? 'On-time attendance' : 'No-absence';
      return `${modeText} streak of at least ${minDays} recorded school days in the current term`;
    }
    case 'academicAverage': {
      const minPercentage = readNumber((criterion as any).minPercentage);
      const scope = readScope((criterion as any).scope);
      const subject = context.subjectName ?? null;
      const subjectText = subject ? `in ${subject}` : 'overall';
      const scopeText = getBadgeScopeLabel(scope);
      return `Academic average of at least ${minPercentage}% ${subjectText}${scopeText ? `, ${scopeText}` : ''}`;
    }
    case 'academicImprovement': {
      const minPoints = readNumber((criterion as any).minPoints);
      return `Academic improvement of at least ${minPoints} percentage points from the previous term`;
    }
    case 'academicConsistency': {
      const minPercentage = readNumber((criterion as any).minPercentage);
      return `Academic consistency of at least ${minPercentage}% in every subject this term`;
    }
    default:
      return LEGACY_CRITERIA_LABEL;
  }
}

export function formatProgressValue(
  value: number | null | undefined,
  unit: BadgeProgressUnit | string,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'No data';
  }

  const rounded = Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, '');

  switch (unit) {
    case 'percent':
      return `${rounded}%`;
    case 'points':
      return `${rounded} points`;
    case 'days':
      return `${rounded} days`;
    case 'score':
      return rounded;
    default:
      return rounded;
  }
}

function formatPercent(value: number | null | undefined): string {
  return formatProgressValue(value, 'percent');
}

function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value)
    ? 'No data'
    : String(value);
}

export type CriterionProgressStatus =
  | 'met'
  | 'pending'
  | 'waiting'
  | 'notApplicable'
  | 'insufficient'
  | 'manual';

export interface CriterionProgressText {
  typeLabel: string;
  scopeLabel: string | null;
  valueText: string;
  detailText: string;
  stateText: string | null;
  status: CriterionProgressStatus;
  percent: number | null;
}

function detailTextFor(
  criterion: StudentBadgeProgressCriterion,
): string {
  const details = criterion.details ?? {};

  switch (criterion.type) {
    case 'attributeAverage':
      return `Evaluations: ${formatNumber(
        details.evaluationCount ?? 0,
      )} of ${formatNumber(details.requiredEvaluationCount ?? 0)} required`;
    case 'attendanceRate':
      return `Recorded school days: ${formatNumber(
        details.recordedSchoolDays ?? 0,
      )} of ${formatNumber(details.requiredRecordedSchoolDays ?? 0)} required. Present: ${formatNumber(
        details.presentCount ?? 0,
      )}, Late: ${formatNumber(
        details.lateCount ?? 0,
      )}, Excused: ${formatNumber(
        details.excusedCount ?? 0,
      )}, Absent: ${formatNumber(details.absentCount ?? 0)}`;
    case 'attendanceStreak':
      return `${getBadgeStreakModeLabel(details.mode)}. Recorded days: ${formatNumber(
        details.recordedDays ?? 0,
      )}. Best streak: ${formatNumber(
        details.bestStreak ?? 0,
      )} of ${formatNumber(
        details.target ?? criterion.target ?? 0,
      )} days. Current streak: ${formatNumber(details.currentStreak ?? 0)}`;
    case 'academicAverage': {
      const subject = details.subjectName
        ? `Subject: ${details.subjectName}.`
        : 'Overall average.';
      const setup =
        details.subjectHasSetup === false
          ? ' No assessment setup found for this subject.'
          : '';
      const lockedShareText =
        details.lockedShare === null || details.lockedShare === undefined
          ? 'Locked share unavailable.'
          : `${formatPercent(details.lockedShare)} locked.`;
      return `${subject} Locked stages: ${formatNumber(
        details.lockedStageCount ?? 0,
      )} of ${formatNumber(
        details.requiredStageCount ?? 0,
      )}. ${lockedShareText}${setup}`;
    }
    case 'academicImprovement':
      return `Current term: ${
        details.currentTermName || 'Current term'
      } (${formatPercent(details.currentTermAverage)}). Previous term: ${
        details.previousTermName || 'Previous term'
      } (${formatPercent(
        details.previousTermAverage,
      )}). Change: ${formatProgressValue(
        details.changePoints,
        'points',
      )}`;
    case 'academicConsistency':
      return `Subjects: ${formatNumber(
        details.subjectCount ?? details.subjectAverages?.length ?? 0,
      )}. Lowest subject: ${
        details.lowestSubjectName || 'None'
      } (${formatPercent(
        details.lowestSubjectAverage,
      )}). Locked stages: ${formatNumber(
        details.lockedStageCount ?? 0,
      )} of ${formatNumber(details.requiredStageCount ?? 0)}`;
    default:
      return '';
  }
}

export function formatCriterionProgress(
  criterion: StudentBadgeProgressCriterion,
): CriterionProgressText {
  const typeMeta = getBadgeCriteriaTypeMeta(criterion.type);
  const typeLabel = typeMeta?.label ?? LEGACY_CRITERIA_LABEL;
  const scopeApplies =
    criterion.type === 'attributeAverage' ||
    criterion.type === 'attendanceRate' ||
    criterion.type === 'academicAverage';
  const scopeLabel =
    scopeApplies && criterion.scope
      ? getBadgeProgressScopeLabel(criterion.scope) || null
      : null;
  const details = criterion.details ?? {};

  if (!typeMeta || criterion.unit === 'manual') {
    return {
      typeLabel,
      scopeLabel,
      valueText: 'Manual',
      detailText:
        typeMeta === null
          ? 'This criterion uses an older format and is shown for reference only.'
          : 'This criterion is recognized manually.',
      stateText: null,
      status: 'manual',
      percent: null,
    };
  }

  const currentText =
    criterion.current === null
      ? 'No data yet'
      : formatProgressValue(criterion.current, criterion.unit);
  const targetText =
    criterion.target === null
      ? 'No target'
      : formatProgressValue(criterion.target, criterion.unit);
  const valueText =
    criterion.target === null ? currentText : `${currentText} of ${targetText}`;

  const percent =
    criterion.current !== null &&
    criterion.target !== null &&
    criterion.target > 0
      ? Math.min(
          100,
          Math.max(0, (criterion.current / criterion.target) * 100),
        )
      : null;

  const detailText = detailTextFor(criterion);
  const lockedShare =
    criterion.lockedShare ?? details.lockedShare ?? null;

  if (criterion.notApplicable || details.notApplicable) {
    const reason = details.reason ? `: ${details.reason}` : '';
    return {
      typeLabel,
      scopeLabel,
      valueText,
      detailText,
      stateText: `Not applicable this term${reason}`,
      status: 'notApplicable',
      percent: null,
    };
  }

  if (criterion.waitingForAssessments || details.waitingForAssessments) {
    const lockedText =
      lockedShare === null || lockedShare === undefined
        ? ''
        : `, ${formatPercent(lockedShare)} locked`;
    return {
      typeLabel,
      scopeLabel,
      valueText,
      detailText,
      stateText: `Waiting for assessments to be locked${lockedText}`,
      status: 'waiting',
      percent,
    };
  }

  if (!criterion.enoughData) {
    return {
      typeLabel,
      scopeLabel,
      valueText,
      detailText,
      stateText: 'Not enough data yet',
      status: 'insufficient',
      percent,
    };
  }

  return {
    typeLabel,
    scopeLabel,
    valueText,
    detailText,
    stateText: criterion.met ? 'Met' : 'Not met',
    status: criterion.met ? 'met' : 'pending',
    percent,
  };
}
