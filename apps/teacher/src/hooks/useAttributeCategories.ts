import type { IAttributeCategory } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';

interface AttributeCategoriesResponse {
  success: boolean;
  data: IAttributeCategory[];
  message?: string;
}

export const ATTRIBUTE_CATEGORIES_QUERY_KEY = ['attribute', 'all'] as const;

export function useAttributeCategories() {
  const { get } = useApi();

  const query = get<AttributeCategoriesResponse>('/attribute?all=true', {
    queryKey: ATTRIBUTE_CATEGORIES_QUERY_KEY,
    staleTime: 60_000,
    retry: 1,
  });

  return {
    categories: query.data?.success ? (query.data.data ?? []) : [],
    isLoading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
