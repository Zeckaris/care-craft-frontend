import { message } from 'antd';
import apiClient from '@/services/api-client'; 
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';


export const useApi = () => {
  const queryClient= useQueryClient();

  const get= (url: string, options={})=>{
    return useQuery({
      queryKey: [url],
      queryFn: ()=>apiClient.get(url).then(r =>r.data),
      ...options,
    })
  }
  const createMutation = <TData= any, TVariables = any>( method: 'post' | 'put' | 'delete', options?: UseMutationOptions<TData, any, TVariables>)=>{
    return useMutation({
      mutationFn: (vars : any)=> apiClient[method](vars.url, vars.body).then(r => r.data),
      onSuccess: (res: any, variables : any)=>{
        message.success(res.message || 'Success!')
        const base = variables.url.split('/')[1];
        queryClient.invalidateQueries({ queryKey: [base] });
      },
      onError: (error:any)=>{
        const msg= error.response?.data?.message || 'Request Failed'
        message.error(msg);
      },
       ...options,
    })
  }

  const post= createMutation('post');
  const put= createMutation('put')
  const del= createMutation('delete')


  return { loading: false, get , post: post.mutateAsync, put : put.mutateAsync,
    del: del.mutateAsync, postMutation: post, putMutation: put, deleteMutation: del,
   };
};