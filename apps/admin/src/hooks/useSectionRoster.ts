import { useApi } from '@/hooks/useApi';
import type { ISectionRoster } from '@carecraft/types';

/**
 * GET /api/section/:id/roster
 *
 * Returns the active students currently assigned to a section, plus the
 * section itself. Loads up to 500 students (the realistic section size) in a
 * single call so the drawer can search/paginate on the client.
 */
export const useSectionRoster = (sectionId?: string) => {
  const { get } = useApi();

  const fetchUrl = `/section/${sectionId}/roster?page=1&limit=500`;
  const queryKey = ['/section', sectionId, 'roster'];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    enabled: !!sectionId,
    staleTime: 15_000,
  });

  const roster = raw?.success ? (raw.data as ISectionRoster) : null;

  return {
    roster,
    enrollments: roster?.enrollments ?? [],
    total: raw?.pagination?.total ?? roster?.enrollments.length ?? 0,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
