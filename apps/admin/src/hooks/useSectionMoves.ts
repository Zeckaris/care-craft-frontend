import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type { IEnrollment, IBulkMoveSectionResult } from '@carecraft/types';

/**
 * Moving students between sections of the same grade and school year.
 *
 *  - PATCH /api/enrollment/:id/section          (single)
 *  - POST  /api/enrollment/bulk-move-section    (bulk, non-atomic)
 *
 * The bulk route always answers HTTP 200 with `success: true`, even on a
 * partial failure, so callers must inspect `failedCount`.
 */
export const useSectionMoves = () => {
  const queryClient = useQueryClient();
  const { patch, post, patchMutation, postMutation } = useApi();

  const invalidateDependents = () => {
    queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
    queryClient.invalidateQueries({ queryKey: ['/enrollment/unassigned'] });
    queryClient.invalidateQueries({ queryKey: ['/section'] });
  };

  const moveOne = async (
    enrollmentId: string,
    targetSectionId: string
  ): Promise<IEnrollment> => {
    const result = await patch({
      url: `/enrollment/${enrollmentId}/section`,
      body: { targetSectionId },
      invalidateKey: false,
      toast: false,
    });
    invalidateDependents();
    return result?.data as IEnrollment;
  };

  const bulkMove = async (
    enrollmentIds: string[],
    targetSectionId: string
  ): Promise<IBulkMoveSectionResult> => {
    const result = await post({
      url: '/enrollment/bulk-move-section',
      body: { enrollmentIds, targetSectionId },
      invalidateKey: false,
      toast: false,
    });
    invalidateDependents();
    return result?.data as IBulkMoveSectionResult;
  };

  return {
    moveOne,
    bulkMove,
    isMoving: patchMutation.isPending || postMutation.isPending,
  };
};
