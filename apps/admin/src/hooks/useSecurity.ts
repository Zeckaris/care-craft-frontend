import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export const useSecurity = () => {
  const { put, patch, postMutation, putMutation, patchMutation } = useApi();
  const queryClient = useQueryClient();

  const basePath = '/security';

  // Toggle MFA for the current admin (self only)
  const toggleMfa = async (enable: boolean) => {
    await patch({ 
      url: `${basePath}/mfa`, 
      body: { mfaEnabled: enable } 
    });
    // Invalidate me query to refresh MFA status
    queryClient.invalidateQueries({ queryKey: ['/auth/me'] });
  };

  // Suspend a user (admin only)
  const suspendUser = async (userId: string, reason?: string) => {
    await patch({ 
      url: `/users/${userId}/suspend`, 
      body: reason ? { suspensionReason: reason } : {} 
    });
  };

  // Unsuspend a user (admin only)
  const unsuspendUser = async (userId: string) => {
    await patch({ 
      url: `/users/${userId}/unsuspend`, 
      body: {} 
    });
  };

  const isSaving = postMutation.isPending || putMutation.isPending || patchMutation.isPending;

  return {
    toggleMfa,
    suspendUser,
    unsuspendUser,
    isSaving,
  };
};