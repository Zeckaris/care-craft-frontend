/**
 * useMySections — fetches GET /section/my.
 *
 * Returns the teacher's sections for the current academic year.
 * Uses the shared useApi hook wired to the teacher's axios instance.
 */
import type { MySectionsData } from '@/types/teacher';
import { useApi } from '@/hooks/useApi';

export function useMySections() {
  const { get } = useApi();

  const query = get<{ success: boolean; data: MySectionsData; error: null | unknown }>(
    '/section/my',
    {
      queryKey: ['section', 'my'],
      staleTime: 2 * 60 * 1000, // 2 min — sections don't change often
      retry: 1,
    },
  );

  const sections: MySectionsData = query.data?.success ? (query.data.data ?? []) : [];
  const error: string | null = query.error
    ? (query.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Failed to load sections. Please try again.'
    : null;

  return {
    sections,
    isLoading: query.isLoading,
    error,
    refetch: query.refetch,
  };
}
