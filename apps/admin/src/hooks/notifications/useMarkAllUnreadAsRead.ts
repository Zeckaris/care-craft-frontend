import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

export const useMarkAllUnreadAsRead = () => {
  const { patch, patchMutation } = useApi();  
  const queryClient = useQueryClient();

  const markAllAsRead = async () => {
    try {
      const response = await patch({
        url: '/notifications/read-all-unread',
        body: {},
      });

      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/total-count'] });

      return response;
    } catch (error) {
      console.error('Failed to mark all unread as read:', error);
      throw error;
    }
  };

  return {
    markAllAsRead,
    isLoading: patchMutation.isPending,     
    isError: patchMutation.isError,
    error: patchMutation.error,
  };
};