import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/services/api-client';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  const markOneMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await apiClient.patch(`/notifications/${notificationId}/read`, {});
      return res.data;
    },
    onMutate: async (notificationId: string) => {
      // Optimistic update in infinite query cache
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((item: any) =>
              item._id === notificationId ? { ...item, isRead: true } : item
            ),
          })),
        };
      });

      // Optimistically decrement unread count if > 0
      queryClient.setQueryData(['/notifications/unread-count'], (old: number | undefined) =>
        old && old > 0 ? old - 1 : 0
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/total-count'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark notification as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch('/notifications/read-all-unread', {});
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      queryClient.setQueriesData({ queryKey: ['notifications'] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data?.map((item: any) => ({ ...item, isRead: true })),
          })),
        };
      });

      queryClient.setQueryData(['/notifications/unread-count'], 0);
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || 'All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/total-count'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to mark all as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/notifications/unread-count'] });
    },
  });

  const markAsRead = async (notificationId: string) => {
    if (!isOnline) {
      toast.error('Offline: Cannot mark notification as read while offline');
      return;
    }
    return markOneMutation.mutateAsync(notificationId);
  };

  const markAllAsRead = async () => {
    if (!isOnline) {
      toast.error('Offline: Cannot mark all as read while offline');
      return;
    }
    return markAllMutation.mutateAsync();
  };

  return {
    markAsRead,
    markAllAsRead,
    isMarkingRead: markOneMutation.isPending,
    isMarkingAllRead: markAllMutation.isPending,
    isOnline,
  };
}
