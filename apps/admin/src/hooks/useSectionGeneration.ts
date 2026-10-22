import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type {
  ISectionGenerationInput,
  ISectionGenerationResult,
} from '@carecraft/types';

/**
 * POST /api/section/generate
 *
 * A dry run (dryRun: true) returns the plan without writing anything. A real
 * run creates/reuses sections and assigns unassigned students, then refreshes
 * every list that depends on sections or enrollments.
 */
export const useSectionGeneration = () => {
  const queryClient = useQueryClient();
  const { post, postMutation } = useApi();

  const invalidateDependents = () => {
    queryClient.invalidateQueries({ queryKey: ['/section'] });
    queryClient.invalidateQueries({ queryKey: ['/enrollment'] });
    queryClient.invalidateQueries({ queryKey: ['/enrollment/unassigned'] });
  };

  const generate = async (
    input: ISectionGenerationInput,
    dryRun: boolean
  ): Promise<ISectionGenerationResult> => {
    const result = await post({
      url: '/section/generate',
      body: { ...input, dryRun },
      invalidateKey: false,
      toast: false,
    });

    if (!dryRun) {
      invalidateDependents();
    }

    return result?.data as ISectionGenerationResult;
  };

  return {
    generate,
    isGenerating: postMutation.isPending,
  };
};
