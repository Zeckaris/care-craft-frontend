/**
 * Teacher useLogout hook.
 * Clears local state, calls the backend signout, and navigates to /signin.
 */
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { clearUser } from '@carecraft/utils';
import { useUser } from '@/context/UserContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { post } = useApi();
  const { setUser } = useUser();

  const logout = async () => {
    try {
      await post({ url: '/auth/signout' });
    } catch {
      console.warn('Backend logout failed, proceeding locally');
    } finally {
      clearUser();
      setUser(null);
      toast.info('You have been logged out.');
      navigate('/signin', { replace: true });
    }
  };

  return { logout };
};
