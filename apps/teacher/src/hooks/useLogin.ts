/**
 * Teacher useLogin hook.
 *
 * Uses the shared makeUseLogin factory with sonner toasts and the
 * teacher UserContext for user state.
 */
import { useState } from 'react';
import { toast } from 'sonner';
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

      // MFA step 1 — backend returns success:true but error.mfaRequired:true
      if (res.success && res.error?.mfaRequired) {
        toast.info('A verification code has been sent to your email.');
        return { mfaRequired: true };
      }

      if (res.success) {
        const { firstName, role, email: userEmail, _id } = res.data.user;

        // Role guard: only teachers may use this app
        if (role !== 'teacher') {
          const msg = `Access denied. This app is for teachers only. Your role is "${role}".`;
          setError(msg);
          toast.error(msg);
          return null;
        }

        setUser({ id: _id, firstName: capitalizeFirstLetter(firstName), role, email: userEmail });
        toast.success(res.message || 'Welcome back!');
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

      // Suspended account
      if (axiosErr?.response?.status === 403 && backendMsg) {
        setError(backendMsg);
        toast.error(backendMsg);
        return null;
      }

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
