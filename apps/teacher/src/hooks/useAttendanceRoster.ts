/**
 * Attendance roster query + online prefetch.
 *
 * The roster is a normal persisted TanStack Query, so a section/date opened
 * while online remains readable offline. Homeroom sections' today roster is
 * prefetched on the dashboard when the device is online.
 */
import { useEffect } from 'react';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { schoolToday } from '@carecraft/attendance';
import type { SectionAttendanceData } from '@carecraft/types';
import type { MySectionItem } from '@/types/teacher';
import { fetchSectionAttendance } from '@/services/attendance-api';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const ATTENDANCE_QUERY_ROOT = 'attendance';

export function attendanceRosterQueryKey(sectionId: string, date: string): QueryKey {
  return [ATTENDANCE_QUERY_ROOT, 'roster', sectionId, date];
}

export function useAttendanceRoster(sectionId: string | undefined, date: string) {
  return useQuery<SectionAttendanceData>({
    queryKey: attendanceRosterQueryKey(sectionId ?? '', date),
    queryFn: () => fetchSectionAttendance(sectionId as string, date),
    enabled: Boolean(sectionId && date),
    staleTime: 30_000,
    retry: 1,
    refetchOnReconnect: true,
  });
}

/**
 * Warm today's roster for every homeroom section while online, so attendance
 * can be taken even if the connection drops before the teacher opens it.
 */
export function usePrefetchHomeroomRosters(sections: MySectionItem[]): void {
  const online = useOnlineStatus();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!online || sections.length === 0) return;
    const date = schoolToday();
    for (const item of sections) {
      if (!item.isHomeroom) continue;
      const sectionId = item.section._id;
      void queryClient.prefetchQuery({
        queryKey: attendanceRosterQueryKey(sectionId, date),
        queryFn: () => fetchSectionAttendance(sectionId, date),
        staleTime: 30_000,
      });
    }
  }, [online, sections, queryClient]);
}
