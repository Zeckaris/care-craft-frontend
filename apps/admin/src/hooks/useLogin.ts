import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';

export const useLogin = () => {
  const { post, loading } = useApi();
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    const res = await post('/auth/signin', { email, password });

    if (!res) {
      setError('Login failed. Please try again.');
      return null;
    }

    if (res.success) {
      message.success(res.message || 'Login successful!');
      return res.data.user; // { id, email, role }
    } else {
      const statusInfo = res.status ? ` (${res.status} ${res.statusText})` : '';
      setError(`${res.message || 'Invalid email or password'}${statusInfo}`);
      return null;
    }
  };

  return { login, loading, error, setError };
};