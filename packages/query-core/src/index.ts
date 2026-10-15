/**
 * @carecraft/query-core
 *
 * Provides the `useApi` hook — a thin wrapper around @tanstack/react-query
 * that exposes typed `get`, `post`, `put`, `patch`, and `del` helpers backed
 * by an Axios instance you supply at the call-site.
 *
 * DESIGN GOALS
 * ─────────────
 * • No hard dependency on Ant Design or any other UI library.
 * • No hard dependency on react-router-dom.
 * • Toast (success/error) and invalidation key logic are configurable via
 *   options; the defaults keep the original admin behaviour exactly.
 * • The admin app plugs in antd's `message.success` / `message.error`.
 *   Other apps supply their own handlers.
 *
 * USAGE
 * ─────
 * // 1. Create a configured axios instance once (per app):
 * import { createApiClient } from '@carecraft/api-client';
 * const { apiClient } = createApiClient({ baseURL: import.meta.env.VITE_API_BASE_URL });
 *
 * // 2. Create a bound `useApi` factory for the app:
 * import { makeUseApi } from '@carecraft/query-core';
 * import { message } from 'antd';
 * export const useApi = makeUseApi(apiClient, {
 *   onSuccess: (msg) => message.success(msg),
 *   onError:   (msg) => message.error(msg),
 * });
 *
 * // 3. Call it inside React components/hooks:
 * const { get, post, put, patch, del } = useApi();
 */

import type { AxiosInstance } from 'axios';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseApiOptions {
  /**
   * Called with the success message returned by the backend (`res.message`).
   * Defaults to `console.log`.
   */
  onSuccess?: (message: string) => void;
  /**
   * Called with the error message extracted from the response.
   * Defaults to `console.error`.
   */
  onError?: (message: string) => void;
}

export interface MutationVars {
  url: string;
  body?: unknown;
  /**
   * Custom query-key prefix to invalidate after the mutation succeeds.
   * Defaults to the URL's second path segment (original admin behaviour).
   * Pass an explicit key or array to override.
   *
   * Example: `invalidateKey: ['student']`   → invalidates all student queries.
   * Example: `invalidateKey: false`         → skip automatic invalidation.
   */
  invalidateKey?: QueryKey | false;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Returns a React hook (`useApi`) bound to the given Axios instance and
 * optional toast handlers.
 *
 * Call this once per app and re-export as `useApi`.
 */
export function makeUseApi(
  client: AxiosInstance,
  globalOptions: UseApiOptions = {},
) {
  const {
    onSuccess: globalOnSuccess = (msg: string) => console.log('[useApi]', msg),
    onError: globalOnError = (msg: string) => console.error('[useApi]', msg),
  } = globalOptions;

  return function useApi() {
    const queryClient = useQueryClient();

    // ── GET ─────────────────────────────────────────────────────────────────
    const get = <TData = any>(
      url: string,
      options?: Record<string, unknown>,
    ) => {
      const { queryKey: customKey, ...rest } = options || {};

      return useQuery<TData>({
        queryKey: (customKey ?? [url]) as QueryKey,
        queryFn: () => client.get(url).then((r: any) => r.data),
        ...(rest as any),
      });
    };

    // ── Mutation factory ─────────────────────────────────────────────────────
    const createMutation = <TData = any, TVariables extends MutationVars = MutationVars>(
      method: 'post' | 'put' | 'patch' | 'delete',
      perCallOptions?: UseMutationOptions<TData, any, TVariables>,
    ) => {
      const {
        onSuccess: customOnSuccess,
        onError: customOnError,
        ...restOptions
      } = perCallOptions || {};

      return useMutation<TData, any, TVariables>({
        ...restOptions,
        mutationFn: (vars: TVariables) => {
          if (method === 'delete') {
            return client.delete(vars.url, { data: vars.body }).then((r: any) => r.data);
          }
          return (client as any)[method](vars.url, vars.body).then((r: any) => r.data);
        },

        onSuccess: (res: any, variables: TVariables, context: any) => {
          // Toast
          globalOnSuccess((res as any)?.message || 'Success!');

          // Invalidation
          if (variables.invalidateKey !== false) {
            let key: QueryKey;
            if (variables.invalidateKey !== undefined) {
              key = Array.isArray(variables.invalidateKey)
                ? (variables.invalidateKey as QueryKey)
                : ([variables.invalidateKey] as QueryKey);
            } else {
              // Original behaviour: second path segment of the URL
              const base = variables.url.split('/')[1];
              key = [base];
            }
            queryClient.invalidateQueries({ queryKey: key });
          }

          // Per-call override
          (customOnSuccess as any)?.(res, variables, context);
        },

        onError: (error: any, variables: TVariables, context: any) => {
          const msg = error.response?.data?.message || 'Request Failed';
          globalOnError(msg);
          (customOnError as any)?.(error, variables, context);
        },
      });
    };

    const post = createMutation('post');
    const put = createMutation('put');
    const del = createMutation('delete');
    const patch = createMutation('patch');

    return {
      /** @deprecated kept for compatibility — always `false` */
      loading: false as const,
      get,
      post: post.mutateAsync,
      put: put.mutateAsync,
      patch: patch.mutateAsync,
      del: del.mutateAsync,
      postMutation: post,
      putMutation: put,
      patchMutation: patch,
      deleteMutation: del,
    };
  };
}
