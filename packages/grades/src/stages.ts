/**
 * Pure stage helpers for the class sheet: ordering, the next conductable stage
 * and the conducted-weight denominator.
 */
import type { AssessmentStageState, ClassSheetColumn } from '@carecraft/types';

/** Columns in conduct order. */
export function orderColumns(columns: ClassSheetColumn[]): ClassSheetColumn[] {
  return [...columns].sort((a, b) => a.order - b.order);
}

/** The first stage still to be conducted (the only one that may be conducted). */
export function nextConductableColumn(columns: ClassSheetColumn[]): ClassSheetColumn | null {
  return orderColumns(columns).find((c) => c.state === 'not-conducted') ?? null;
}

/** Sum of every conducted (including locked) column's max score. */
export function conductedMaxTotal(columns: ClassSheetColumn[]): number {
  return columns
    .filter((c) => c.state !== 'not-conducted')
    .reduce((sum, c) => sum + c.maxScore, 0);
}

/** Sum of every conducted column's weight (the average denominator). */
export function conductedWeightTotal(columns: ClassSheetColumn[]): number {
  return columns
    .filter((c) => c.state !== 'not-conducted')
    .reduce((sum, c) => sum + c.weight, 0);
}

/** Sum of every locked column's max score (the results sheet's Total denominator). */
export function lockedMaxTotal(columns: ClassSheetColumn[]): number {
  return columns
    .filter((c) => c.state === 'locked')
    .reduce((sum, c) => sum + c.maxScore, 0);
}

/** Human label for a stage state. */
export function stageStateLabel(state: AssessmentStageState): string {
  switch (state) {
    case 'locked':
      return 'Locked';
    case 'conducted':
      return 'Conducted';
    default:
      return 'Not conducted';
  }
}

/**
 * Stage-state label as shown on the read-only results sheet. A conducted but
 * unlocked stage is "In progress" because the subject teacher has not completed
 * it yet, so its marks are not visible to admins.
 */
export function resultStageStateLabel(state: AssessmentStageState): string {
  switch (state) {
    case 'locked':
      return 'Locked';
    case 'conducted':
      return 'In progress';
    default:
      return 'Not conducted';
  }
}

/** Whether the stage's marks may be entered by a teacher. */
export function canEnterMarks(state: AssessmentStageState): boolean {
  return state === 'conducted';
}
