import { useApi } from '@/hooks/useApi';

export const useCurrentUser = () => {
  const { get, loading: isLoading } = useApi();

  const { data: rawData, isLoading: queryLoading, refetch } = get('/auth/me', {
    retry: false, // ← THIS STOPS INFINITE RETRIES ON 401
    staleTime: 5 * 60 * 1000, // Optional: cache for 5 minutes
  });

  const user = rawData?.success ? rawData.data : null;
  const error = rawData && !rawData.success ? rawData.message : null;

  return {
    user,
    isLoading: isLoading || queryLoading,
    error,
    refetch,
  };
};