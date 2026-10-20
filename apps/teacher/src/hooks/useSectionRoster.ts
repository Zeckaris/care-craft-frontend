import type { ISectionRoster } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

interface SectionRosterResponse {
  success: boolean;
  data: ISectionRoster;
  message?: string;
  pagination?: { total: number; page: number; limit: number };
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
