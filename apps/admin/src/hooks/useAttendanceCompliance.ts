import { useApi } from '@/hooks/useApi';

export interface AttendanceComplianceSection {
  sectionId: string;
  sectionName: string;
  label: string;
  grade: string;
  homeroomTeacher: {
    id: string;
    name: string;
  } | null;
}

export interface AttendanceCompliancePartialSection extends AttendanceComplianceSection {
  marked: number;
  total: number;
}

export interface AttendanceComplianceDay {
  date: string | null;
  applicable: boolean;
  reason?: string | null;
  notTaken: AttendanceComplianceSection[];
  partiallyTaken: AttendanceCompliancePartialSection[];
}

export interface AttendanceComplianceData {
  today: AttendanceComplianceDay;
  previousSchoolDay: AttendanceComplianceDay | null;
}

export const useAttendanceCompliance = ({ enabled = true } = {}) => {
  const { get } = useApi();

  const { data: raw, isLoading, isError, error, refetch } = get(
    '/dashboard/attendance-compliance',
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: false,
    }
  );

  const data: AttendanceComplianceData | null = raw?.success
    ? (raw.data as AttendanceComplianceData)
    : null;

  return {
    data,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
