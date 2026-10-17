import { useApi } from '@/hooks/useApi';
import type { IUnassignedEnrollment } from '@carecraft/types';

interface UseUnassignedEnrollmentsParams {
  gradeId?: string;
  schoolYear?: string;
}

/**
 * GET /api/enrollment/unassigned?gradeId=&schoolYear=
 *
 * gradeId is required by the backend; when it is missing the query is
 * disabled. The endpoint returns every matching enrollment (no pagination),
 * so callers must do search/pagination on the client.
 */
export const useUnassignedEnrollments = ({
  gradeId,
  schoolYear,
}: UseUnassignedEnrollmentsParams = {}) => {
  const { get } = useApi();

  const params = new URLSearchParams();
  if (gradeId) params.set('gradeId', gradeId);
  if (schoolYear) params.set('schoolYear', schoolYear);

  const fetchUrl = `/enrollment/unassigned?${params.toString()}`;
  const queryKey = ['/enrollment/unassigned', { gradeId, schoolYear }];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    enabled: !!gradeId,
    staleTime: 30_000,
  });

  const payload = raw?.success
    ? (raw.data as { enrollments: IUnassignedEnrollment[]; count: number })
    : null;

  return {
    enrollments: payload?.enrollments ?? [],
    count: payload?.count ?? 0,
    isLoading,
    isError,
    fetchError: error,
    refetch,
    enabled: !!gradeId,
  };
};
