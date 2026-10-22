import { useApi } from '@/hooks/useApi';

export interface ChronicAbsenteeStudent {
  studentId: string;
  studentName: string;
  sectionId: string | null;
  sectionLabel: string | null;
  grade: string | null;
  absenceDates: string[];
  absentDayCount: number;
  appearsInBothWeeks: boolean;
}

export interface ChronicAbsenteeWeek {
  startDate: string | null;
  endDate: string | null;
  asOfDate: string | null;
  absentees: ChronicAbsenteeStudent[];
}

export interface ChronicAbsenteesData {
  minimumAbsentDays: number;
  includesExcused: boolean;
  reason?: string | null;
  currentWeek: ChronicAbsenteeWeek;
  previousWeek: ChronicAbsenteeWeek;
}

export const useChronicAbsentees = ({ enabled = true } = {}) => {
  const { get } = useApi();

  const { data: raw, isLoading, isError, error, refetch } = get(
    '/dashboard/chronic-absentees',
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: false,
    }
  );

  const data: ChronicAbsenteesData | null = raw?.success
    ? (raw.data as ChronicAbsenteesData)
    : null;

  return {
    data,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
