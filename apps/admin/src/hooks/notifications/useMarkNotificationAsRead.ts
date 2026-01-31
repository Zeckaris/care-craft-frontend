import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export const useMarkNotificationAsRead = () => {
  const { patch, patchMutation } = useApi();
  const queryClient = useQueryClient();

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await patch({
        url: `/notifications/${notificationId}/read`,
        body: {}, // no body required
      });

      // Invalidate relevant queries to refresh lists & counts
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/total-count'] });

      return response;
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
      throw error;
    }
  };

  return {
    markAsRead,
    isLoading: patchMutation.isPending,
    isError: patchMutation.isError,
    error: patchMutation.error,
  };
};