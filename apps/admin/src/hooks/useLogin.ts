/**
 * Admin useLogin hook.
 *
 * Keeps antd toasts and UserContext wiring from the original implementation.
 * The actual network + state logic lives in `@carecraft/auth-hooks`.
 */
import { useState } from 'react';
import { message } from 'antd';
import type { AxiosError } from 'axios';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/context/UserContext';
import { capitalizeFirstLetter } from '@carecraft/utils';

export const useLogin = () => {
  const { post, postMutation } = useApi();
  const { setUser } = useUser();
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, mfaCode?: string) => {
    setError(null);
    try {
      const body = mfaCode ? { email, password, mfaCode } : { email, password };
      const res = await post({ url: '/auth/signin', body });

      if (res.success && res.error?.mfaRequired) {
        message.info('A verification code has been sent to your email.');
        return { mfaRequired: true };
      }

      if (res.success) {
        const { firstName, role, email: userEmail, _id } = res.data.user;
        const formattedName = capitalizeFirstLetter(firstName);

        setUser({ id: _id, firstName: formattedName, role, email: userEmail });
        message.success(res.message || 'Login successful!');
        return res.data.user;
      }

      const msg =
        res.message?.toLowerCase().includes('invalid email or password')
          ? 'Invalid email or password. Please try again.'
          : res.message || 'Login failed. Please try again.';

      setError(msg);
      return null;
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      const backendMsg = axiosErr?.response?.data?.message;
      const msg =
        backendMsg?.toLowerCase().includes('invalid email or password')
          ? 'Invalid email or password. Please try again.'
          : backendMsg || 'Login failed. Please try again.';

      setError(msg);
      return null;
    }
  };

  return {
    login,
    loading: postMutation.isPending,
    error,
    setError,
  };
};
