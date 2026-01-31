import { useApi } from '@/hooks/useApi';

export const useNotificationCounts = ({ refetchInterval = 60000 } = {}) => {
  const { get } = useApi();

  const unreadQuery = get('/notifications/unread-count', {
    refetchInterval,
    refetchOnWindowFocus: true,
    select: (response: any) => response?.data?.unreadCount ?? 0,
  });

  const totalQuery = get('/notifications/total-count', {
    refetchInterval,
    refetchOnWindowFocus: true,
    select: (response: any) => response?.data?.totalCount ?? 0,
  });

  return {
    unreadCount: unreadQuery.data ?? 0,
    totalCount: totalQuery.data ?? 0,
    isLoading: unreadQuery.isLoading || totalQuery.isLoading,
    isError: unreadQuery.isError || totalQuery.isError,
    error: unreadQuery.error || totalQuery.error,
    refetch: () => {
      unreadQuery.refetch();
      totalQuery.refetch();
    },
  };
};