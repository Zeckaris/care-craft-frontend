import type { AxiosInstance } from 'axios';
import { extractApiErrorMessage } from '@carecraft/query-core';
import type { StudentBadge, StudentBadgeProgress } from '@carecraft/types';

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
}

export interface StudentBadgeGiftInput {
  given: boolean;
  note?: string;
}

export interface BadgesApi {
  fetchStudentBadgeProgress(studentId: string): Promise<StudentBadgeProgress>;
  updateStudentBadgeGift(
    awardId: string,
    input: StudentBadgeGiftInput,
  ): Promise<StudentBadge>;
}

function toApiError(error: unknown): Error {
  const message = extractApiErrorMessage(error);
  const wrapped = new Error(message) as Error & {
    status?: number;
    response?: unknown;
  };
  const response = (error as { response?: { status?: number } } | undefined)
    ?.response;
  if (response) {
    wrapped.response = response;
    if (typeof response.status === 'number') {
      wrapped.status = response.status;
    }
  }
  return wrapped;
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

    async updateStudentBadgeGift(
      awardId: string,
      input: StudentBadgeGiftInput,
    ): Promise<StudentBadge> {
      try {
        const res = await client.patch<Envelope<StudentBadge>>(
          `/studentBadge/${awardId}/gift`,
          input,
        );

        if (!res.data?.success) {
          throw new Error(
            res.data?.message || 'Failed to update the gift status',
          );
        }

        return res.data.data;
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}
