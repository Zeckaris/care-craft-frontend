import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/hooks/useApi';
import type { IUser } from '@/components/users/UserEditDrawer';


interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

interface UseCoordinatorsParams {
  page?: number;
  pageSize?: number;
}

export const useCoordinators = ({
  page = 1,
  pageSize = 10,
}: UseCoordinatorsParams = {}) => {
  const queryClient = useQueryClient();
  const { get, put, del, putMutation, deleteMutation } = useApi();

  const [currentPage, setCurrentPage] = useState(page);

  const params = new URLSearchParams();
  params.set('page', String(currentPage));
  params.set('limit', String(pageSize));

  const fetchUrl = `/adminUser/coordinators?${params.toString()}`;
  const queryKey = ['/adminUser/coordinators', { page: currentPage, pageSize }];

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

  const coordinators: IUser[] = raw?.success ? (raw.data as IUser[]) : [];
  const paginationMeta: PaginationMeta = raw?.pagination ?? { total: 0, page: 1, limit: 10 };

  const update = async (id: string, data: Partial<IUser>) => {
    const result = await put({ url: `/adminUser/users/${id}`, body: data });
    queryClient.invalidateQueries({
      queryKey: ['/adminUser/coordinators'],
      refetchType: 'all',
    });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `/adminUser/users/${id}` });
    queryClient.invalidateQueries({
      queryKey: ['/adminUser/coordinators'],
      refetchType: 'all',
    });
    return result;
  };

  return {
    coordinators,
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