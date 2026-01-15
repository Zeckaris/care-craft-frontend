import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';
import { capitalizeFirstLetter } from '@/utils/string';
import { useUser } from '@/context/UserContext';

export const useLogin = () => {
  const { post, postMutation } = useApi(); 
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUser(); // <-- set user in context

  const login = async (email: string, password: string, mfaCode?: string) => {
    setError(null);
    try {
      const body = mfaCode 
        ? { email, password, mfaCode }
        : { email, password };

      const res = await post({ url: '/auth/signin', body });

      if (res.success && res.error?.mfaRequired) {
        message.info('A verification code has been sent to your email.');
        return { mfaRequired: true };
      }

      if (res.success) {
        const { firstName, role, email: userEmail, _id } = res.data.user;
        const formattedName = capitalizeFirstLetter(firstName);

        // Set user in context
        setUser({ id: _id, firstName: formattedName, role, email: userEmail });

        message.success(res.message || 'Login successful!');
        return res.data.user;
      }

      if (res.message && res.message.toLowerCase().includes('invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(res.message || 'Login failed. Please try again.');
      }

      return null;
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      if (backendMsg && backendMsg.toLowerCase().includes('invalid email or password')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(backendMsg || 'Login failed. Please try again.');
      }
      return null;
    }  
  };

  return { 
    login, 
    loading: postMutation.isPending, 
    error, 
    setError 
  };
};
