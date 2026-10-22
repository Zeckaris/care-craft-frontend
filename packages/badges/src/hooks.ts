import { useQuery } from '@tanstack/react-query';
import type { StudentBadgeProgress } from '@carecraft/types';
import type { BadgesApi } from './api';
import { badgesKeys } from './keys';

export function createBadgeHooks(api: BadgesApi) {
  function useStudentBadgeProgress(studentId?: string) {
    return useQuery<StudentBadgeProgress>({
      queryKey: badgesKeys.studentProgress(studentId ?? ''),
      queryFn: () => api.fetchStudentBadgeProgress(studentId as string),
      enabled: Boolean(studentId),
      staleTime: 30_000,
      retry: 1,
      refetchOnReconnect: true,
      meta: { persist: false },
    });
  }

  return { useStudentBadgeProgress };
}
