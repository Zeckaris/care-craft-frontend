/**
 * Admin useLogout hook.
 * Uses `clearUser` from the shared utils package; keeps antd + react-router-dom
 * wiring local to the admin app (as required by the architecture).
 */
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useApi } from '@/hooks/useApi';
import { clearUser } from '@carecraft/utils';

export const useLogout = () => {
  const navigate = useNavigate();
  const { post } = useApi();

  const logout = async () => {
    try {
      await post({ url: '/auth/signout', toast: false });
    } catch {
      console.warn('Backend logout failed, proceeding locally');
    } finally {
      clearUser();
      message.info('You have been logged out');
      navigate('/signin', { replace: true });
    }
  };

  return { logout };
};