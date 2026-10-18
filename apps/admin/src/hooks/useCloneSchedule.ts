import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type {
  ICloneSchedulePayload,
  ICloneScheduleResult,
} from '@carecraft/types';

/**
 * POST /api/schedule/schedules/:id/clone
 *
 * Clones a published or archived schedule into a new draft. A 409 with
 * `response.data.data.scheduleId` means a draft already exists and the caller
 * must retry with `replaceExistingDraft: true`.
 */
export const useCloneSchedule = () => {
  const queryClient = useQueryClient();
  const { post, postMutation } = useApi();

  const clone = async (
    scheduleId: string,
    payload: ICloneSchedulePayload = {}
  ): Promise<ICloneScheduleResult | undefined> => {
    const result = await post({
      url: `/schedule/schedules/${scheduleId}/clone`,
      body: payload,
      invalidateKey: false,
    });
    queryClient.invalidateQueries({ queryKey: ['/schedule/schedules'] });
    queryClient.invalidateQueries({ queryKey: ['/schedule/draft'] });
    return result?.data as ICloneScheduleResult | undefined;
  };

  return {
    clone,
    isCloning: postMutation.isPending,
  };
};
