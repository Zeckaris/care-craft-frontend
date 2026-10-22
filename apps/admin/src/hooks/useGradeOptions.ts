import { useMemo } from 'react';
import { useApi } from '@/hooks/useApi';
import type { IGrade } from '@/hooks/useGrades';
import { getGradeOptionLabel } from '@/utils/badges';

export const GRADE_OPTIONS_QUERY_KEY = ['/grade', 'options'] as const;

export const useGradeOptions = () => {
  const { get } = useApi();

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get('/grade', {
    queryKey: GRADE_OPTIONS_QUERY_KEY,
    staleTime: 5 * 60_000,
  });

  const grades: IGrade[] = useMemo(
    () => (raw?.success && Array.isArray(raw.data) ? raw.data : []),
    [raw],
  );

  const gradeOptions = useMemo(
    () =>
      grades.map((grade) => ({
        value: grade._id,
        label: getGradeOptionLabel(grade),
      })),
    [grades],
  );

  const gradeLabelById = useMemo(
    () => new Map(gradeOptions.map((option) => [option.value, option.label])),
    [gradeOptions],
  );

  return {
    grades,
    gradeOptions,
    gradeLabelById,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
