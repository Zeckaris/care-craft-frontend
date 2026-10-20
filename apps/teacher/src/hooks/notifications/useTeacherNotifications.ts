import { useInfiniteQuery } from '@tanstack/react-query';
import type { INotification, INotificationPagination } from '@carecraft/types';
import { useUser } from '@/context/UserContext';
import { apiClient } from '@/services/api-client';

export type NotificationTab = 'unread' | 'all';

interface NotificationsApiResponse {
  success: boolean;
  message: string;
  data: INotification[];
  pagination?: INotificationPagination;
}

export function useTeacherNotifications(tab: NotificationTab = 'unread') {
  const { user } = useUser();
  const enabled = !!user;

  const query = useInfiniteQuery<NotificationsApiResponse, Error>({
    queryKey: ['notifications', tab],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await apiClient.get<NotificationsApiResponse>(
        `/notifications/${tab}?page=${pageParam}&limit=10`
      );
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.pagination;
      if (!pagination) return undefined;
      const totalFetched = allPages.reduce(
        (sum, p) => sum + (p?.data?.length || 0),
        0
      );
      if (totalFetched < pagination.total) {
        return pagination.page + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: 60 * 1000, // 1 minute fresh
    gcTime: 1000 * 60 * 60 * 24, // 24 hours retention
  });

  const notifications: INotification[] =
    query.data?.pages?.flatMap((page) => page.data || []) ?? [];

  const firstPagePagination = query.data?.pages?.[0]?.pagination;
  const totalCount = firstPagePagination?.total ?? notifications.length;

  return {
    notifications,
    totalCount,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    error: query.error,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
