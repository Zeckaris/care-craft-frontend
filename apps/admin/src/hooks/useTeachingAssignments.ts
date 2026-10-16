import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import type { ITeachingAssignment, TeachingRole } from '@carecraft/types';

export type { ITeachingAssignment, TeachingRole };

interface UseTeachingAssignmentsParams {
  sectionId?: string;
  teacherId?: string;
  role?: TeachingRole;
  schoolYear?: string;
  page?: number;
  pageSize?: number;
}

export const useTeachingAssignments = ({
  sectionId,
  teacherId,
  role,
  schoolYear,
  page = 1,
  pageSize = 100, // load all for a given section by default
}: UseTeachingAssignmentsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, patch, del, postMutation, patchMutation, deleteMutation } = useApi();

  const urlPath = '/teaching-assignment';

  const params = new URLSearchParams();
  if (sectionId) params.set('sectionId', sectionId);
  if (teacherId) params.set('teacherId', teacherId);
  if (role) params.set('role', role);
  if (schoolYear) params.set('schoolYear', schoolYear);
  params.set('page', String(page));
  params.set('limit', String(pageSize));

  const fetchUrl = `${urlPath}?${params.toString()}`;
  const queryKey = [urlPath, { sectionId, teacherId, role, schoolYear, page, pageSize }];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 15_000,
    // only fire if we have a sectionId to avoid an unbounded load
    enabled: !!sectionId,
  });

  const assignments: ITeachingAssignment[] = raw?.success
    ? (raw.data as ITeachingAssignment[])
    : [];
  const paginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 100 };

  /** Create a new assignment (homeroom or subject). */
  const create = async (data: {
    sectionId: string;
    teacherId: string;
    role: TeachingRole;
    subjectId?: string;
  }) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  /** Reassign the teacher on an existing assignment. */
  const reassign = async (id: string, teacherId: string) => {
    const result = await patch({
      url: `${urlPath}/${id}/reassign`,
      body: { teacherId },
    });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  return {
    assignments,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,
    isLoading,
    isError,
    fetchError: error as any,
    refetch,

    create,
    reassign,
    remove,

    isCreating: postMutation.isPending,
    isReassigning: patchMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
