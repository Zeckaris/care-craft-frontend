import { useApi } from '@/hooks/useApi';

export interface AttendanceSnapshot {
  date: string | null;
  schoolYear: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  marked: number;
  expected: number;
  sectionsWithRecords: number;
  totalSections: number;
}

export const useAttendanceSnapshot = ({ enabled = true } = {}) => {
  const { get } = useApi();

  const { data: raw, isLoading, isError, error, refetch } = get(
    '/dashboard/attendance-snapshot',
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const snapshot: AttendanceSnapshot | null = raw?.success
    ? (raw.data as AttendanceSnapshot)
    : null;

  return {
    snapshot,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
