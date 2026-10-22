import type {
  AttendanceRecordInput,
  AttendanceResultItem,
  AttendanceRosterRow,
  AttendanceSaveResponse,
  SectionAttendanceData,
} from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

const EMPTY_ROSTER: AttendanceRosterRow[] = [];

interface AttendanceEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AttendanceSchoolDay {
  date?: string;
  schoolYear?: string;
  isSchoolDay: boolean;
  reason?: string | null;
}

interface UseSchoolDayParams {
  date: string;
  schoolYear: string;
  enabled?: boolean;
}

export const useAttendanceSchoolDay = ({
  date,
  schoolYear,
  enabled = true,
}: UseSchoolDayParams) => {
  const { get } = useApi();

  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (schoolYear) params.set('schoolYear', schoolYear);

  const { data: raw, isLoading, isError, error, refetch } = get<
    AttendanceEnvelope<AttendanceSchoolDay>
  >(`/attendance/school-day?${params.toString()}`, {
    queryKey: ['attendance', 'school-day', date, schoolYear],
    enabled: enabled && Boolean(date && schoolYear),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const responseError =
    raw && !raw.success
      ? new Error(raw.message ?? 'Could not determine whether this is a school day')
      : null;

  return {
    schoolDay: raw?.success ? raw.data : null,
    isLoading,
    isError,
    error: error ?? responseError,
    refetch,
  };
};

interface UseAttendanceRosterParams {
  sectionId?: string;
  date: string;
  enabled?: boolean;
}

export const useAttendanceRoster = ({
  sectionId,
  date,
  enabled = true,
}: UseAttendanceRosterParams) => {
  const { get } = useApi();

  const { data: raw, isLoading, isFetching, isError, error, refetch } = get<
    AttendanceEnvelope<SectionAttendanceData>
  >(sectionId && date ? `/attendance/section/${sectionId}/date/${date}` : '', {
    queryKey: ['attendance', 'roster', sectionId, date],
    enabled: enabled && Boolean(sectionId && date),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const responseError =
    raw && !raw.success
      ? new Error(raw.message ?? 'Failed to load the attendance roster')
      : null;

  return {
    attendance: raw?.success ? raw.data : null,
    roster: raw?.success ? (raw.data?.roster ?? EMPTY_ROSTER) : EMPTY_ROSTER,
    total: raw?.success ? (raw.data?.total ?? 0) : 0,
    marked: raw?.success ? (raw.data?.marked ?? 0) : 0,
    isLoading,
    isFetching,
    isError,
    error: error ?? responseError,
    refetch,
  };
};

export const useSaveAttendance = () => {
  const { postMutation } = useApi();

  const saveAttendance = async (
    sectionId: string,
    date: string,
    records: AttendanceRecordInput[],
  ): Promise<AttendanceResultItem[]> => {
    const response = (await postMutation.mutateAsync({
      url: `/attendance/section/${sectionId}/date/${date}`,
      body: { records },
      invalidateKey: false,
    })) as AttendanceSaveResponse | undefined;

    if (!response) {
      throw new Error('The attendance save returned no response');
    }

    return response.data?.results ?? [];
  };

  return {
    saveAttendance,
    isSaving: postMutation.isPending,
  };
};
