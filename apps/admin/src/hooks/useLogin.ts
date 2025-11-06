import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';
import { capitalizeFirstLetter } from '@/utils/string';

export const useLogin = () => {
  const { post, loading } = useApi();
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setError(null);
    try{
    const res = await post( { url: '/auth/signin', body: { email, password }});
    if (res.success) {
      const { firstName, role } = res.data.user;
      const formattedName = capitalizeFirstLetter(firstName);
      localStorage.setItem('user', JSON.stringify({ firstName: formattedName, role }));
      message.success(res.message || 'Login successful!');
      return res.data.user; // { id, email, role }
    } else {
      const statusInfo = res.status ? ` (${res.status} ${res.statusText})` : '';
      setError(`${res.message || 'Invalid email or password'}${statusInfo}`);
      return null;
    }
    }catch(err){
      setError('Login failed. Please try again.');
      return null;
    }  
  };

  return { login, loading, error, setError };
};