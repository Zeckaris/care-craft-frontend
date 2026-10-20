import type { IAttributeEvaluation } from '@carecraft/types';
import { useUser } from '@/context/UserContext';
import { useApi } from '@/hooks/useApi';

interface AttributeEvaluationsResponse {
  success: boolean;
  data: IAttributeEvaluation[];
  message?: string;
  pagination?: { total: number; page: number; limit: number };
}

export interface AttributeEvaluationInput {
  studentId: string;
  studentEnrollmentId: string;
  attributes: Array<{
    attributeId: string;
    score: number;
    comment?: string;
  }>;
  remark?: string;
}

export const ATTRIBUTE_EVALUATION_QUERY_ROOT = ['attribute-evaluation'] as const;

export function attributeEvaluationIndexQueryKey(teacherId: string | undefined) {
  return [...ATTRIBUTE_EVALUATION_QUERY_ROOT, 'index', teacherId ?? ''] as const;
}

export function studentAttributeEvaluationQueryKey(
  teacherId: string | undefined,
  studentId: string | undefined,
  enrollmentId: string | undefined,
) {
  return [
    ...ATTRIBUTE_EVALUATION_QUERY_ROOT,
    'student',
    teacherId ?? '',
    studentId ?? '',
    enrollmentId ?? '',
  ] as const;
}

/**
 * One request for the whole status map. The backend scopes this list to
 * students in the teacher's sections; the roster then matches by enrollment.
 */
export function useAttributeEvaluationIndex(enabled = true) {
  const { get } = useApi();
  const { user } = useUser();
  const teacherId = user?.id;

  const query = get<AttributeEvaluationsResponse>('/attribute-evaluation?limit=1000', {
    queryKey: attributeEvaluationIndexQueryKey(teacherId),
    enabled: enabled && Boolean(teacherId),
    staleTime: 15_000,
    retry: 1,
  });

  return {
    evaluations: query.data?.success ? (query.data.data ?? []) : [],
    isLoading: enabled && Boolean(teacherId) && query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useStudentAttributeEvaluation(
  studentId: string | undefined,
  enrollmentId: string | undefined,
) {
  const { get } = useApi();
  const { user } = useUser();
  const teacherId = user?.id;

  const query = get<AttributeEvaluationsResponse>(
    `/attribute-evaluation/student/${studentId ?? ''}?enrollmentId=${enrollmentId ?? ''}&limit=1`,
    {
      queryKey: studentAttributeEvaluationQueryKey(teacherId, studentId, enrollmentId),
      enabled: Boolean(teacherId && studentId && enrollmentId),
      staleTime: 0,
      retry: 1,
    },
  );

  const evaluations = query.data?.success ? (query.data.data ?? []) : [];

  return {
    evaluation: evaluations[0] ?? null,
    isLoading: Boolean(teacherId && studentId && enrollmentId) && query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSaveAttributeEvaluation() {
  const { post, put, postMutation, putMutation } = useApi();

  const saveEvaluation = async ({
    id,
    payload,
  }: {
    id?: string;
    payload: AttributeEvaluationInput;
  }) => {
    const variables = {
      url: id ? `/attribute-evaluation/${id}` : '/attribute-evaluation',
      body: payload,
      toast: false,
      invalidateKey: [...ATTRIBUTE_EVALUATION_QUERY_ROOT],
    };

    return id ? put(variables) : post(variables);
  };

  return {
    saveEvaluation,
    isSaving: postMutation.isPending || putMutation.isPending,
  };
}
