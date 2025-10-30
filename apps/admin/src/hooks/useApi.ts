import { useState } from 'react';
import { message } from 'antd';
import apiClient from '@/services/api-client'; 


export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const request = async (method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any) => {
    setLoading(true);
    try {
      const response = await apiClient[method](url, data);
      return response.data; 
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Request failed';
      message.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, get: (url: string) => request('get', url), post: (url: string, data: any) => request('post', url, data) };
};