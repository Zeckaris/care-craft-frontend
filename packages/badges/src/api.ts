import type { AxiosInstance } from 'axios';
import { extractApiErrorMessage } from '@carecraft/query-core';
import type { StudentBadgeProgress } from '@carecraft/types';

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
}

export interface BadgesApi {
  fetchStudentBadgeProgress(studentId: string): Promise<StudentBadgeProgress>;
}

export function createBadgesApi(client: AxiosInstance): BadgesApi {
  return {
    async fetchStudentBadgeProgress(studentId: string): Promise<StudentBadgeProgress> {
      try {
        const res = await client.get<Envelope<StudentBadgeProgress>>(
          '/studentBadge/progress',
          { params: { studentId } },
        );

        if (!res.data?.success) {
          throw new Error(res.data?.message || 'Failed to load badge progress');
        }

        return res.data.data;
      } catch (error) {
        throw new Error(extractApiErrorMessage(error));
      }
    },
  };
}
