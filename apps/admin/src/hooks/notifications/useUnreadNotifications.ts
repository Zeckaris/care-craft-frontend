import { useApi } from '@/hooks/useApi';
import type { Notification } from './notification.type';

export const useUnreadNotifications = () => {
  const { get } = useApi();

  const query = get('/notifications/unread', {
    staleTime: 2 * 60 * 1000, 
  });

  return {
    notifications: (query.data?.data || []) as Notification[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};