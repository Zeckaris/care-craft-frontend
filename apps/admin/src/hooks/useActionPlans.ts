import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';


export interface IActionPlan {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  issue: string;
  goal: string;
  actionSteps: {
    _id?: string;
    step: string;
    completed: boolean;
    responsibleParty: 'teacher' | 'parent' | 'either';
  }[];
  progressRating?: number;
  startDate: string; // ISO date string
  endDate: string;
  createdAt: string;
  __v?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseActionPlansParams {
  teacherId?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  pagination?: { page: number; pageSize: number };
  search?: string; // Optional: search by student name or issue
}

export const useActionPlans = ({
  teacherId,
  startDate,
  endDate,
  pagination = { page: 1, pageSize: 10 },
  search = '',
}: UseActionPlansParams = {}) => {
  const queryClient = useQueryClient();
  const { get, post, put, patch, del, postMutation, putMutation, patchMutation, deleteMutation } = useApi();

  // Build query params
  const params = new URLSearchParams();
  if (teacherId) params.set('teacherId', teacherId);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (search) params.set('search', search);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.pageSize));

  const fetchUrl = `/actionPlan?${params.toString()}`;
  const queryKey = ['/actionPlan', { teacherId, startDate, endDate, search, pagination }];

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const plans: IActionPlan[] = raw?.success ? (raw.data as IActionPlan[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // Mutations
  const create = async (data: Omit<IActionPlan, '_id' | 'createdAt' | 'progressRating'>) => {
    const result = await post({ url: '/actionPlan', body: data });
    queryClient.invalidateQueries({ queryKey: ['/actionPlan'] });
    return result;
  };

  const update = async (id: string, data: Partial<Omit<IActionPlan, '_id' | 'createdAt' | 'progressRating'>>) => {
    const result = await put({ url: `/actionPlan/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: ['/actionPlan'] });
    return result;
  };

  const updateStep = async (planId: string, stepIndex: number, stepData: Partial<{
    step: string;
    completed: boolean;
    responsibleParty: 'teacher' | 'parent' | 'either';
  }>) => {
    const result = await patch({
      url: `/actionPlan/${planId}/step/${stepIndex}`,
      body: stepData,
    });
    queryClient.invalidateQueries({ queryKey: ['/actionPlan'] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/actionPlan/${id}` });
    queryClient.invalidateQueries({ queryKey: ['/actionPlan'] });
    return result;
  };

  return {
    // Data
    plans,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,

    // Loading & Error
    isLoading,
    isError,
    fetchError: error as any,

    // Actions
    refetch,
    create,
    update,
    updateStep,
    remove,

    // Mutation states
    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isPatchingStep: patchMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};