import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';
import { capitalizeFirstLetter } from '@/utils/string';

export const useAdminSignup = () => {
  const { post, postMutation } = useApi();
  const { isPending } = postMutation;
  const [role, setRole] = useState<'admin' | 'coordinator' | null>(null);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const signup = async (data: any) => {
    setIsSignupSuccess(false);
    const res = await post({url : '/auth/signup', body: data});

    if (res.success) {
      const { firstName, role } = res.data.user;
      const formattedName = capitalizeFirstLetter(firstName);
      localStorage.setItem('user', JSON.stringify({ firstName: formattedName, role }));
      setRole(role);
      message.success(res.message || 'Account created!');
    }
    // Error already shown in useApi
  };

  return { loading: isPending, role, signup, isSignupSuccess };
};