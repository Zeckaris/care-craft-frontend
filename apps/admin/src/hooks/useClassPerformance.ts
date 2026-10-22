import { useApi } from '@/hooks/useApi';

export interface TopPerformingClass {
  sectionId: string;
  sectionName: string;
  gradeLevel: string;
  average: number;
  studentCount: number;
  countAbove80: number;
}

export interface ClassPerformance {
  academicTermId: string | null;
  termName: string | null;
  schoolYear: string | null;
  basis: 'locked-stages';
  threshold: number;
  topClasses: TopPerformingClass[];
}

export const useClassPerformance = ({ enabled = true } = {}) => {
  const { get } = useApi();

  const { data: raw, isLoading, isError, error, refetch } = get(
    '/dashboard/class-performance',
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const performance: ClassPerformance | null = raw?.success
    ? (raw.data as ClassPerformance)
    : null;

  return {
    performance,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
