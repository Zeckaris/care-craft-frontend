/**
 * useTeacherPicker
 *
 * Loads all active (non-suspended) teachers for use in assignment pickers.
 * Uses limit=0 to get every record in one call — suitable for Select dropdowns.
 */
import { useApi } from '@/hooks/useApi';
import type { IUser } from '@carecraft/types';

export const useTeacherPicker = () => {
  const { get } = useApi();

  const { data: raw, isLoading } = get('/adminUser/teachers?limit=0', {
    queryKey: ['/adminUser/teachers', { limit: 0 }],
    staleTime: 60_000,
  });

  const teachers: IUser[] = raw?.success ? (raw.data as IUser[]) : [];

  return { teachers, isLoading };
};
