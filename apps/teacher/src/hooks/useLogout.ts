/**
 * Teacher useLogout hook.
 * Clears local state, calls the backend signout, and navigates to /signin.
 */
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useApi } from '@/hooks/useApi';
import { clearUser } from '@carecraft/utils';
import { useUser } from '@/context/UserContext';
import { idbPersister } from '@/lib/idb-persister';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { post } = useApi();
  const { setUser } = useUser();

  const logout = async () => {
    try {
      await post({ url: '/auth/signout', toast: false });
    } catch {
      console.warn('Backend logout failed, proceeding locally');
    } finally {
      clearUser();
      setUser(null);
      // Drop every cached query (identity, sections, rosters) from memory AND
      // IndexedDB so the next teacher who signs in never sees this account's
      // sections, roster or attendance state.
      queryClient.clear();
      void idbPersister.removeClient();
      toast.info('You have been logged out.');
      navigate('/signin', { replace: true });
    }
  };

  return { logout };
};
