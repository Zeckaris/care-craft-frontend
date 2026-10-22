import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StudentBadge, StudentBadgeProgress } from '@carecraft/types';
import type { BadgesApi } from './api';
import {
  badgesKeys,
  invalidateStudentGiftQueries,
} from './keys';

export interface UpdateStudentBadgeGiftVariables {
  awardId: string;
  given: boolean;
  note?: string;
}

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

  function useStudentBadgeGiftMutation() {
    const queryClient = useQueryClient();

    return useMutation<StudentBadge, Error, UpdateStudentBadgeGiftVariables>({
      mutationFn: ({ awardId, given, note }) =>
        api.updateStudentBadgeGift(awardId, { given, note }),
      onSuccess: (_data, variables) =>
        invalidateStudentGiftQueries(queryClient, variables.awardId),
    });
  }

  return { useStudentBadgeProgress, useStudentBadgeGiftMutation };
}
