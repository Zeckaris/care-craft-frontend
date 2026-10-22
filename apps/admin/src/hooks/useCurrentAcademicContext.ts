import type { ICurrentAcademicContext } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

export const CURRENT_ACADEMIC_CONTEXT_QUERY_KEY = ['/calendar/current-context'];

export const useCurrentAcademicContext = () => {
  const { get } = useApi();

  const { data: raw, isLoading, isError, error, refetch } = get(
    '/calendar/current-context',
    {
      queryKey: CURRENT_ACADEMIC_CONTEXT_QUERY_KEY,
      staleTime: 60_000,
    },
  );

  const context: ICurrentAcademicContext | null = raw?.success
    ? (raw.data as ICurrentAcademicContext)
    : null;

  return {
    context,
    isLoading,
    isError,
    error,
    refetch,
  };
};
