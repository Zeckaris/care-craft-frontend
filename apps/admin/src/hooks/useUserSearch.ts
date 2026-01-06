import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchUser {
  id: string;
  fullName: string;
  role: string;
  isSuspended: boolean;
}

interface UseUserSearchOptions {
  roleFilter?: string;    
  suspendedOnly?: boolean; 
  minLength?: number;
  debounceMs?: number;
}

export const useUserSearch = (
  query: string,
  options: UseUserSearchOptions = {}
) => {
  const {
    roleFilter,
    suspendedOnly = false,
    minLength = 2,
    debounceMs = 300,
  } = options;

  const debouncedQuery = useDebounce(query.trim(), debounceMs);

  const enabled = debouncedQuery.length >= minLength;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['userSearch', debouncedQuery, roleFilter],
    queryFn: async () => {
      if (!enabled) return [];

      let url = `/adminUser/search?q=${encodeURIComponent(debouncedQuery)}`;
      if (roleFilter) {
        url += `&role=${encodeURIComponent(roleFilter)}`;
      }

      const response = await apiClient.get(url);
      
      
      if (response.data?.success) {
        let users: SearchUser[] = response.data.data || [];

        // Client-side filtering for suspended/active
        if (suspendedOnly) {
          users = users.filter(u => u.isSuspended);
        } else {
          users = users.filter(u => !u.isSuspended); // default: only show active for suspend
        }

        return users;
      }

      return [];
    },
    enabled,
    placeholderData: [], 
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return {
    users: data ?? [],
    loading: isLoading,
    error: isError,
  };
};