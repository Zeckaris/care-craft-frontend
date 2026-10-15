/**
 * Admin useApi hook.
 *
 * Binds the shared `makeUseApi` factory (from `@carecraft/query-core`) to:
 *   • the admin's singleton Axios instance
 *   • antd `message.success` / `message.error` as the toast handlers
 *
 * Usage inside admin hooks and components is identical to before:
 *   const { get, post, put, patch, del } = useApi();
 */
import { message } from 'antd';
import { makeUseApi } from '@carecraft/query-core';
import { apiClient } from '@/services/api-client';

export const useApi = makeUseApi(apiClient, {
  onSuccess: (msg) => message.success(msg),
  onError:   (msg) => message.error(msg),
});