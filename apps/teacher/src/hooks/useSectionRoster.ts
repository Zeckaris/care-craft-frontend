import { useQueries } from '@tanstack/react-query';
import type { ISectionRoster } from '@carecraft/types';
import { apiClient } from '@/services/api-client';
import { useApi } from '@/hooks/useApi';

interface SectionRosterResponse {
  success: boolean;
  data: ISectionRoster;
  message?: string;
  pagination?: { total: number; page: number; limit: number };
}

export async function fetchSectionRoster(
  sectionId: string,
): Promise<SectionRosterResponse> {
  const response = await apiClient.get<SectionRosterResponse>(
    `/section/${sectionId}/roster?page=1&limit=500`,
  );
  return response.data;
}

export function sectionRosterQueryKey(sectionId: string | undefined) {
  return ['section', sectionId ?? '', 'roster'] as const;
}

export function useSectionRoster(sectionId: string | undefined) {
  const { get } = useApi();

  const query = get<SectionRosterResponse>(
    `/section/${sectionId ?? ''}/roster?page=1&limit=500`,
    {
      queryKey: sectionRosterQueryKey(sectionId),
      enabled: Boolean(sectionId),
      staleTime: 30_000,
      retry: 1,
    },
  );

  const roster = query.data?.success ? query.data.data : null;
  const enrollments = roster?.enrollments ?? [];

  return {
    roster,
    enrollments,
    section: roster?.section ?? null,
    total: query.data?.pagination?.total ?? enrollments.length,
    isLoading: Boolean(sectionId) && query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Loads the rosters for several sections, sharing the single-section cache keys. */
export function useSectionRosters(sectionIds: string[], enabled = true) {
  const results = useQueries({
    queries: sectionIds.map((sectionId) => ({
      queryKey: sectionRosterQueryKey(sectionId),
      queryFn: () => fetchSectionRoster(sectionId),
      enabled: enabled && Boolean(sectionId),
      staleTime: 30_000,
      retry: 1,
    })),
  });

  const enrollments = results.flatMap((result) =>
    result.data?.success ? result.data.data.enrollments : [],
  );
  const firstError = results.find((result) => result.error)?.error ?? null;

  return {
    enrollments,
    isLoading:
      enabled &&
      sectionIds.length > 0 &&
      results.some((result) => result.isPending),
    isFetching: results.some((result) => result.isFetching),
    error: firstError,
    refetch: () => Promise.all(results.map((result) => result.refetch())),
  };
}
