/**
 * Attendance API access.
 *
 * Thin wrappers over the shared axios client that translate transport failures
 * into the `AttendanceRequestError` kinds the sync manager understands:
 *   network  — no response (offline / DNS / timeout)
 *   server   — 5xx, 408 or 429 (retry with backoff)
 *   auth     — 401 (session expired; pause, never fail the entry)
 *   client   — other 4xx or `success:false` (do not retry; surface the message)
 */
import type {
  AttendanceRecordInput,
  AttendanceResultItem,
  AttendanceSaveResponse,
  SectionAttendanceData,
} from '@carecraft/types';
import { AttendanceRequestError } from '@carecraft/attendance';
import { apiClient } from '@/services/api-client';

/** Maps an axios error to the request-error kind the sync manager acts on. */
function classify(error: unknown): AttendanceRequestError {
  if (error instanceof AttendanceRequestError) return error;

  const axiosError = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };
  const status = axiosError.response?.status;
  const message =
    axiosError.response?.data?.message ?? axiosError.message ?? 'Attendance request failed';

  if (status == null) return new AttendanceRequestError(message, 'network');
  if (status === 401) return new AttendanceRequestError(message, 'auth', status);
  // 408 Request Timeout and 429 Too Many Requests are transient.
  if (status >= 500 || status === 408 || status === 429) {
    return new AttendanceRequestError(message, 'server', status);
  }
  return new AttendanceRequestError(message, 'client', status);
}

export async function fetchSectionAttendance(
  sectionId: string,
  date: string,
): Promise<SectionAttendanceData> {
  try {
    const res = await apiClient.get<{ success: boolean; data: SectionAttendanceData; message?: string }>(
      `/attendance/section/${sectionId}/date/${date}`,
    );
    if (!res.data?.success || !res.data.data) {
      throw new AttendanceRequestError(
        res.data?.message ?? 'Failed to load the attendance roster',
        'client',
      );
    }
    return res.data.data;
  } catch (error) {
    throw classify(error);
  }
}

export async function postAttendanceRecords(
  sectionId: string,
  date: string,
  records: AttendanceRecordInput[],
): Promise<AttendanceResultItem[]> {
  try {
    const res = await apiClient.post<AttendanceSaveResponse>(
      `/attendance/section/${sectionId}/date/${date}`,
      { records },
    );
    if (!res.data?.success) {
      throw new AttendanceRequestError(
        res.data?.message ?? 'The attendance save was rejected',
        'client',
      );
    }
    return res.data.data?.results ?? [];
  } catch (error) {
    throw classify(error);
  }
}
