import { useMemo } from 'react';
import type { IObservation } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

interface ObservationListResponse {
  success: boolean;
  data: IObservation[];
  message?: string;
  pagination?: { total: number; page: number; limit: number };
}

export interface ObservationListParams {
  page: number;
  limit: number;
  studentId?: string;
  teacherId?: string;
  subjectId?: string;
  schoolYear?: string;
  term?: string;
  from?: string;
  to?: string;
}

export interface ObservationCreateInput {
  studentId: string;
  date: string;
  description: string;
  subjectId?: string;
}

export interface ObservationUpdateInput {
  date: string;
  description: string;
  subjectId?: string;
}

export const OBSERVATION_QUERY_ROOT = ['observation'] as const;

export function useObservations(params: ObservationListParams) {
  const { get } = useApi();
  const search = new URLSearchParams();

  if (params.studentId) search.set('studentId', params.studentId);
  if (params.teacherId) search.set('teacherId', params.teacherId);
  if (params.subjectId) search.set('subjectId', params.subjectId);
  if (params.schoolYear) search.set('schoolYear', params.schoolYear);
  if (params.term) search.set('term', params.term);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  search.set('page', String(params.page));
  search.set('limit', String(params.limit));

  const query = get<ObservationListResponse>(`/observation?${search.toString()}`, {
    queryKey: [
      ...OBSERVATION_QUERY_ROOT,
      'list',
      params.studentId ?? '',
      params.teacherId ?? '',
      params.subjectId ?? '',
      params.schoolYear ?? '',
      params.term ?? '',
      params.from ?? '',
      params.to ?? '',
      params.page,
      params.limit,
    ],
    keepPreviousData: true,
    staleTime: 30_000,
    retry: 1,
  });

  const observations = useMemo(() => {
    const items = query.data?.success ? (query.data.data ?? []) : [];
    return [...items].sort((a, b) => {
      const byDate = b.date.slice(0, 10).localeCompare(a.date.slice(0, 10));
      if (byDate !== 0) return byDate;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [query.data]);

  return {
    observations,
    total: query.data?.pagination?.total ?? 0,
    currentPage: query.data?.pagination?.page ?? params.page,
    pageSize: query.data?.pagination?.limit ?? params.limit,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useObservationMutations() {
  const { post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const createObservation = (payload: ObservationCreateInput) =>
    post({
      url: '/observation',
      body: payload,
      toast: false,
      invalidateKey: [...OBSERVATION_QUERY_ROOT],
    });

  const updateObservation = (id: string, payload: ObservationUpdateInput) =>
    put({
      url: `/observation/${id}`,
      body: payload,
      toast: false,
      invalidateKey: [...OBSERVATION_QUERY_ROOT],
    });

  const deleteObservation = (id: string) =>
    del({
      url: `/observation/${id}`,
      toast: false,
      invalidateKey: [...OBSERVATION_QUERY_ROOT],
    });

  return {
    createObservation,
    updateObservation,
    deleteObservation,
    isSaving: postMutation.isPending || putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
