import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type {
  IGenerateSchedulePayload,
  IGenerateScheduleStart,
} from '@carecraft/types';

/**
 * POST /api/schedule/generate
 *
 * Kicks off a generation job. The response carries the job id so the caller
 * can start polling. Failures (400 precheck, 409 running / draft conflict)
 * reject; their `response.data.data` payload is read by the caller.
 */
export const useScheduleGenerate = () => {
  const queryClient = useQueryClient();
  const { post, postMutation } = useApi();

  const generate = async (
    payload: IGenerateSchedulePayload
  ): Promise<IGenerateScheduleStart | undefined> => {
    const result = await post({
      url: '/schedule/generate',
      body: payload,
      invalidateKey: false,
    });
    queryClient.invalidateQueries({ queryKey: ['/schedule/schedules'] });
    return result?.data as IGenerateScheduleStart | undefined;
  };

  return {
    generate,
    isGenerating: postMutation.isPending,
  };
};
