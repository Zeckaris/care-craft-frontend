/**
 * React Query keys for grades data. A single root lets the offline queue
 * invalidate every grades query after a sync in one call.
 */
export const GRADES_QUERY_ROOT = 'grades' as const;

export const gradesKeys = {
  root: [GRADES_QUERY_ROOT] as const,
  currentTerm: () => [GRADES_QUERY_ROOT, 'term', 'current'] as const,
  terms: () => [GRADES_QUERY_ROOT, 'terms'] as const,
  classSheets: () => [GRADES_QUERY_ROOT, 'class-sheet'] as const,
  classSheet: (sectionId: string, subjectId: string, academicTermId: string) =>
    [GRADES_QUERY_ROOT, 'class-sheet', sectionId, subjectId, academicTermId] as const,
  results: (sectionId: string, subjectId: string, academicTermId: string) =>
    [GRADES_QUERY_ROOT, 'results', sectionId, subjectId, academicTermId] as const,
};
