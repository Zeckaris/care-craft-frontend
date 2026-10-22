import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/context/UserContext';
import { apiClient } from '@/services/api-client';

interface UseNotificationCountsOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

export function useNotificationCounts(options: UseNotificationCountsOptions = {}) {
  const { user } = useUser();
  const enabled = (options.enabled ?? true) && !!user;
  const refetchInterval = options.refetchInterval ?? 45000;

  const unreadQuery = useQuery({
    queryKey: ['/notifications/unread-count'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/unread-count');
      return res.data?.data?.unreadCount ?? 0;
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30000,
  });

  const totalQuery = useQuery({
    queryKey: ['/notifications/total-count'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/total-count');
      return res.data?.data?.totalCount ?? 0;
    },
    enabled,
    refetchInterval,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30000,
  });

  return {
    unreadCount: (unreadQuery.data ?? 0) as number,
    totalCount: (totalQuery.data ?? 0) as number,
    isLoading: unreadQuery.isLoading || totalQuery.isLoading,
    isError: unreadQuery.isError || totalQuery.isError,
    error: unreadQuery.error || totalQuery.error,
    refetch: () => {
      unreadQuery.refetch();
      totalQuery.refetch();
    },
  };
}
