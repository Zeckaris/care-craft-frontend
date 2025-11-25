import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export interface IAttributeItem {
  attributeId: {
    _id: string;
    name: string;
    description?: string;
    minScore: number;
    maxScore: number;
  };
  score: number;
  comment?: string;
}

export interface IAttributeEvaluation {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  studentEnrollmentId: {
    _id: string;
    gradeId: {
      _id: string;
      level: string;
    };
    schoolYear: string;
    isActive: boolean;
  } | null;
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  attributes: IAttributeItem[];
  totalScore: number;
  remark?: string;
  createdAt: string;
}

export const useAttributeEvaluations = (
  {
    search = '',
    pagination = { page: 1, pageSize: 10 },
  }: {
    search?: string;
    pagination?: { page: number; pageSize: number };
  } = {}
) => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/attribute-evaluation';

  const params = new URLSearchParams();
  if (search) params.set('search', search); 
  if (pagination) {
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.pageSize));
  }

  const fetchUrl = `${urlPath}?${params.toString()}`;
  const queryKey = [urlPath, { search, pagination }];

  const { data: raw, isLoading, isError, error, refetch } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const evaluations: IAttributeEvaluation[] = raw?.success
    ? (raw.data as IAttributeEvaluation[])
    : [];

  const paginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const create = async (data: {
    studentId: string;
    studentEnrollmentId: string;
    teacherId: string;
    attributes: Array<{
      attributeId: string;
      score: number;
      comment?: string;
    }>;
    remark?: string;
  }) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const update = async (
    id: string,
    data: Partial<{
      studentId: string;
      studentEnrollmentId: string;
      teacherId: string;
      attributes: Array<{
        attributeId: string;
        score: number;
        comment?: string;
      }>;
      remark?: string;
    }>
  ) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(remove));
    return results;
  };

  return {
    evaluations,
    isLoading,
    isError,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,
    fetchError: error as any,
    refetch,

    create,
    update,
    remove,
    removeMany,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};