import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type { IUser } from '@/components/users/UserEditDrawer';


interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseParentsParams {
  page?: number;
  pageSize?: number;
}

export const useParents = ({
  page = 1,
  pageSize = 10,
}: UseParentsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, put, del, putMutation, deleteMutation } = useApi();

  const [currentPage, setCurrentPage] = useState(page);

  const params = new URLSearchParams();
  params.set('page', String(currentPage));
  params.set('limit', String(pageSize));

  const fetchUrl = `/adminUser/parents?${params.toString()}`;
  const queryKey = ['/adminUser/parents', { page: currentPage, pageSize }];

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get(fetchUrl, {
    queryKey,
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const parents: IUser[] = raw?.success ? (raw.data as IUser[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  // === MUTATIONS ===
  const update = async (id: string, data: Partial<IUser>) => {
    const result = await put({ url: `/adminUser/users/${id}`, body: data });

    // Invalidate ALL parent queries (current + other pages)
    queryClient.invalidateQueries({
      queryKey: ['/adminUser/parents'],
      refetchType: 'all', // forces refetch even if inactive
    });

    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/adminUser/users/${id}` });

    // Same fix for delete
    queryClient.invalidateQueries({
      queryKey: ['/adminUser/parents'],
      refetchType: 'all',
    });

    return result;
  };

  return {
    parents,
    total: paginationMeta.total,
    currentPage: paginationMeta.page,
    pageSize: paginationMeta.limit,
    setPage: setCurrentPage,

    isLoading,
    isError,
    fetchError: error as any,

    refetch,
    update,
    remove,

    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};