/**
 * Shared section label formatting.
 *
 * A section label is the grade level immediately followed by the section name,
 * e.g. "Grade 1A". Grade levels can be stored as numbers ("1") or free strings
 * ("Grade 1", "KG"), so the formatter never doubles an existing "Grade" prefix
 * and never invents one for a non-numeric label.
 */
import type { MySection } from '@/types/teacher';

/** Normalises a grade level to a single, human-readable string. */
export function formatGradeLevel(
  level: number | string | null | undefined,
): string {
  const raw = String(level ?? '').trim();
  if (!raw) return '';
  // Already prefixed (e.g. "Grade 1") or a non-numeric label (e.g. "KG").
  if (/^grade\b/i.test(raw) || !/^\d/.test(raw)) return raw;
  return `Grade ${raw}`;
}

/** Strips a redundant leading "Section" word from a section name. */
export function formatSectionName(name: string | null | undefined): string {
  return String(name ?? '')
    .replace(/^section\b[\s:.-]*/i, '')
    .trim();
}

/**
 * Canonical section label used everywhere a section is shown, e.g. "Grade 1A".
 * Accepts either a full section or a partial `{ gradeId, name }` shape.
 */
export function formatSectionLabel(
  section:
    | Pick<MySection, 'name' | 'gradeId'>
    | null
    | undefined,
): string {
  if (!section) return '';
  const grade = formatGradeLevel(section.gradeId?.level);
  const name = formatSectionName(section.name);
  return `${grade}${name}`;
}
