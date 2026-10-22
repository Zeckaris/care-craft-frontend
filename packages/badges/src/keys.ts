import type { QueryClient } from '@tanstack/react-query';

export const BADGES_QUERY_ROOT = 'badges' as const;

export const badgesKeys = {
  root: [BADGES_QUERY_ROOT] as const,
  definitionsRoot: ['/badge'] as const,
  definitionList: (params?: Record<string, unknown>) =>
    ['/badge', 'list', params ?? {}] as const,
  definitionDetail: (badgeId: string) =>
    ['/badge', 'detail', badgeId] as const,
  criteriaRoot: ['/badgeCriteria'] as const,
  criteriaList: (params?: Record<string, unknown>) =>
    ['/badgeCriteria', 'list', params ?? {}] as const,
  eligible: (gradeId: string) =>
    [BADGES_QUERY_ROOT, 'eligible', gradeId] as const,
  studentAwardsRoot: ['studentBadge'] as const,
  studentAwards: (params?: Record<string, unknown>) =>
    ['studentBadge', 'list', params ?? {}] as const,
  studentProgress: (studentId: string) =>
    [BADGES_QUERY_ROOT, 'student-progress', studentId] as const,
};

/**
 * Refreshes every badge surface that can be affected by a badge or criterion
 * change: the badge lists, the open badge detail, criteria lists, awards and
 * student progress.
 */
export function invalidateBadgeQueries(
  queryClient: QueryClient,
  badgeId?: string,
): Promise<void> {
  const tasks = [
    queryClient.invalidateQueries({ queryKey: badgesKeys.definitionsRoot }),
    queryClient.invalidateQueries({ queryKey: badgesKeys.criteriaRoot }),
    queryClient.invalidateQueries({ queryKey: badgesKeys.root }),
    queryClient.invalidateQueries({ queryKey: badgesKeys.studentAwardsRoot }),
  ];

  if (badgeId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: badgesKeys.definitionDetail(badgeId),
      }),
    );
  }

  return Promise.all(tasks).then(() => undefined);
}
