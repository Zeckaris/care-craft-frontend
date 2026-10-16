/**
 * Teacher useApi hook.
 *
 * Binds the shared makeUseApi factory to:
 *   • the teacher's singleton Axios instance
 *   • sonner toast.success / toast.error as the toast handlers
 */
import { toast } from 'sonner';
import { makeUseApi } from '@carecraft/query-core';
import { apiClient } from '@/services/api-client';

export const useApi = makeUseApi(apiClient, {
  onSuccess: (msg) => toast.success(msg),
  onError:   (msg) => toast.error(msg),
});
