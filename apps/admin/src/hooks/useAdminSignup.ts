import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';
import { capitalizeFirstLetter } from '@/utils/string';
import { useUser } from '@/context/UserContext';  

export const useAdminSignup = () => {
  const { post, postMutation } = useApi();
  const { isPending } = postMutation;
  const [role, setRole] = useState<'admin' | 'coordinator' | null>(null);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const { setUser } = useUser();

  const signup = async (data: any) => {
    setIsSignupSuccess(false);

    const res = await post({ url: '/auth/signup', body: data, toast: false });

    if (res.success) {
      const { _id, firstName, role, email } = res.data.user;
      const formattedName = capitalizeFirstLetter(firstName);

      // Update global user context
      setUser({
        id: _id,
        firstName: formattedName,
        role,
        email: email,   
      });

      localStorage.setItem('user', JSON.stringify({ firstName: formattedName, role }));

      setRole(role);
      message.success(res.message || 'Account created and logged in!');

      setIsSignupSuccess(true);
    }

    // Errors are surfaced by the page-level alert.
  };

  return {
    loading: isPending,
    role,
    signup,
    isSignupSuccess,
  };
};