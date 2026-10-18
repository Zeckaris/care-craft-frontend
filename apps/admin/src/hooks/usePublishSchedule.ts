import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type {
  IPublishSchedulePayload,
  IPublishScheduleResult,
} from '@carecraft/types';

/**
 * POST /api/schedule/schedules/:id/publish
 *
 * Publishes a draft. Every failure is a 409 whose `response.data.data` payload
 * the caller inspects (precheck / violations / drift / unplaced / not-a-draft).
 */
export const usePublishSchedule = () => {
  const queryClient = useQueryClient();
  const { post, postMutation } = useApi();

  const publish = async (
    scheduleId: string,
    payload: IPublishSchedulePayload = {}
  ): Promise<IPublishScheduleResult | undefined> => {
    const result = await post({
      url: `/schedule/schedules/${scheduleId}/publish`,
      body: payload,
      invalidateKey: false,
    });
    queryClient.invalidateQueries({ queryKey: ['/schedule/schedules'] });
    queryClient.invalidateQueries({ queryKey: ['/schedule/draft'] });
    return result?.data as IPublishScheduleResult | undefined;
  };

  return {
    publish,
    isPublishing: postMutation.isPending,
  };
};
