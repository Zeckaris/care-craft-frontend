import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';

export const useAdminSignup = () => {
  const { post, postMutation } = useApi();
  const { isPending } = postMutation;
  const [role, setRole] = useState<'admin' | 'coordinator' | null>(null);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const signup = async (data: any) => {
    setIsSignupSuccess(false);
    const res = await post({url : '/auth/signup', body: data});

    if (res.success) {
      // Role comes back in response.data.role (optional)
      if (res.data?.role) {
        setRole(res.data.role);
      }
      setIsSignupSuccess(true);
      message.success(res.message || 'Account created!');
    }
    // Error already shown in useApi
  };

  return { loading: isPending, role, signup, isSignupSuccess };
};