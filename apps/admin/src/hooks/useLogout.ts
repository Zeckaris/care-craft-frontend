import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';
import { clearUser } from '@/utils/auth';

export const useLogout = () => {
  const navigate = useNavigate();
  const { post } = useApi();

  const logout = async () => {
    try {
      await post({ url: '/auth/signout' });
    } catch (error) {
      console.warn('Backend logout failed, proceeding locally');
    } finally {
      clearUser();
      message.info('You have been logged out');
      navigate('/login', { replace: true });
    }
  };

  return { logout };
};