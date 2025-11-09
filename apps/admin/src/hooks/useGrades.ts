import { useApi } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query'; 

export interface IGrade {
  _id: string;
  level: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const useGrades = () => {
  const queryClient = useQueryClient(); // ← Add
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();
  const urlPath = '/grade';

  // Fetch
  const { data: rawData, isLoading, isError } = get(urlPath);
  const grades = rawData?.success ? (rawData.data as IGrade[]) : [];

  // Mutations with auto-refetch
  const create = async (data: Omit<IGrade, '_id'>) => {
    const result = await post({ url: urlPath, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] }); // ← Refetch
    return result;
  };

  const update = async (id: string, data: Omit<IGrade, '_id'>) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    queryClient.invalidateQueries({ queryKey: [urlPath] });
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    queryClient.invalidateQueries({ queryKey: [urlPath] }); 
    return result;
  };

  const removeMany = async (ids: string[]) => {
    const results = await Promise.all(ids.map(_id => remove(_id)));
    return results;
  };

  return {
    grades,
    isLoading,
    isError,

    create,
    update,
    remove,
    removeMany,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};