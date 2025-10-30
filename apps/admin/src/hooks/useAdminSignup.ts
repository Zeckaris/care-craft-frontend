import { useState } from 'react';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';

export const useAdminSignup = () => {
  const { loading, post } = useApi();
  const [role, setRole] = useState<'admin' | 'coordinator' | null>(null);

  const signup = async (data: any) => {
    const res = await post('/auth/signup', data);

    if (res.success) {
      // Role comes back in response.data.role (optional)
      if (res.data?.role) {
        setRole(res.data.role);
      }
      message.success(res.message || 'Account created!');
    }
    // Error already shown in useApi
  };

  return { loading, role, signup };
};