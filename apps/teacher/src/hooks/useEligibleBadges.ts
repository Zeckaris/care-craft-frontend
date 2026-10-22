import { useQuery } from '@tanstack/react-query';
import type { BadgeDefinition } from '@carecraft/types';
import { badgesKeys } from '@carecraft/badges';
import { apiClient } from '@/services/api-client';

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { total: number; page: number; limit: number };
}

const PAGE_SIZE = 50;
export const ELIGIBLE_BADGES_QUERY_ROOT = ['badges', 'eligible'] as const;

export async function fetchAllEligibleBadges(
  gradeId: string,
): Promise<BadgeDefinition[]> {
  const badges: BadgeDefinition[] = [];
  let page = 1;

  while (true) {
    const response = await apiClient.get<Envelope<BadgeDefinition[]>>(
      '/badge',
      {
        params: {
          eligibleGradeId: gradeId,
          page,
          limit: PAGE_SIZE,
        },
      },
    );

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message || 'Failed to load badges');
    }

    const batch = Array.isArray(body.data) ? body.data : [];
    badges.push(...batch);

    const total = body.pagination?.total;
    if (total !== undefined ? badges.length >= total : batch.length < PAGE_SIZE) {
      break;
    }
    if (batch.length === 0) break;

    page += 1;
    if (page > 1000) break;
  }

  return badges;
}

export function useEligibleBadges(gradeId?: string) {
  const query = useQuery<BadgeDefinition[]>({
    queryKey: badgesKeys.eligible(gradeId ?? ''),
    queryFn: () => fetchAllEligibleBadges(gradeId as string),
    enabled: Boolean(gradeId),
    staleTime: 30_000,
    retry: 1,
    refetchOnReconnect: true,
    meta: { persist: false },
  });

  return {
    badges: query.data ?? [],
    isLoading: Boolean(gradeId) && query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
