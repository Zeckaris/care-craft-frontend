import { useApi } from '@/hooks/useApi';

export interface PerformanceAlertSection {
  sectionId: string;
  sectionName: string;
  label: string;
  grade: string;
  average: number;
  studentCount: number;
  lockedStageCount: number;
}

export interface PerformanceAlertSubject {
  sectionId: string;
  sectionName: string;
  label: string;
  grade: string;
  subjectId: string;
  subjectName: string | null;
  average: number;
  studentCount: number;
  lockedStageCount: number;
}

export interface PerformanceAlertsData {
  academicTermId: string | null;
  termName: string | null;
  schoolYear: string | null;
  basis: string;
  threshold: number;
  limit: number;
  reason?: string | null;
  sections: PerformanceAlertSection[];
  subjects: PerformanceAlertSubject[];
}

interface UsePerformanceAlertsOptions {
  enabled?: boolean;
  threshold?: number;
  limit?: number;
}

export const usePerformanceAlerts = ({
  enabled = true,
  threshold = 65,
  limit = 50,
}: UsePerformanceAlertsOptions = {}) => {
  const { get } = useApi();

  const queryParams = new URLSearchParams();
  if (threshold !== undefined) queryParams.set('threshold', String(threshold));
  if (limit !== undefined) queryParams.set('limit', String(limit));
  const queryString = queryParams.toString();
  const endpoint = `/dashboard/performance-alerts${queryString ? `?${queryString}` : ''}`;

  const { data: raw, isLoading, isError, error, refetch } = get(
    endpoint,
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: false,
    }
  );

  const data: PerformanceAlertsData | null = raw?.success
    ? (raw.data as PerformanceAlertsData)
    : null;

  return {
    data,
    isLoading,
    isError,
    fetchError: error,
    refetch,
  };
};
