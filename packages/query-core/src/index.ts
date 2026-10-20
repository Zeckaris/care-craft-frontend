/**
 * @carecraft/query-core
 *
 * Provides the `useApi` hook, a thin wrapper around @tanstack/react-query
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
  /**
   * Set to `false` to suppress the shared success/error toast for this call.
   * The caller is then responsible for showing its own feedback.
   */
  toast?: boolean;
}

/** Outcome of a fan-out batch of mutations (e.g. bulk delete). */
export interface BatchMutationResult {
  /** Number of mutations attempted. */
  total: number;
  /** Number of mutations that resolved successfully. */
  successCount: number;
  /** Number of mutations that failed. */
  failedCount: number;
  /** Human-readable messages for each failure (first message first). */
  errors: string[];
}

// ---------------------------------------------------------------------------
// Error extraction
// ---------------------------------------------------------------------------

/**
 * Pulls a human-readable message out of an error thrown by the API layer.
 *
 * Handles every shape the backend produces:
 *   • envelope on an error response:   { success, message, data, error }
 *   • middleware-style error response: { message }
 *   • nested error object:             { error: { message } }
 *   • plain string body / Error object
 *
 * `error.response.data` is preferred because our own failure detection attaches
 * the original response body there when it turns a `{ success: false }` 2xx
 * envelope into a rejection.
 */
export function extractApiErrorMessage(error: unknown): string {
  const err = error as
    | {
        response?: { data?: unknown };
        message?: string;
      }
    | undefined;

  const data = err?.response?.data;

  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object') {
    const body = data as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }

    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }

    if (
      body.error &&
      typeof body.error === 'object' &&
      typeof (body.error as { message?: unknown }).message === 'string' &&
      (body.error as { message: string }).message.trim()
    ) {
      return (body.error as { message: string }).message;
    }
  }

  if (typeof err?.message === 'string' && err.message.trim()) return err.message;

  return 'Request Failed';
}

/** True when a resolved 2xx body is an envelope that reports failure. */
function isFailureEnvelope(res: unknown): res is {
  success: false;
  message?: unknown;
  error?: unknown;
} {
  return (
    !!res &&
    typeof res === 'object' &&
    (res as { success?: unknown }).success === false
  );
}

/**
 * Runs a fan-out batch of mutation promises and summarises partial failures
 * instead of rejecting on the first one (`Promise.all` behaviour).
 */
export async function settleMutations<T>(
  tasks: Array<Promise<T>>,
): Promise<BatchMutationResult> {
  const results = await Promise.allSettled(tasks);

  const errors: string[] = [];
  let successCount = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      successCount += 1;
    } else {
      errors.push(extractApiErrorMessage(result.reason));
    }
  }

  return {
    total: results.length,
    successCount,
    failedCount: errors.length,
    errors,
  };
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
        mutationFn: async (vars: TVariables) => {
          const response =
            method === 'delete'
              ? await client.delete(vars.url, { data: vars.body })
              : await (client as any)[method](vars.url, vars.body);

          const data = (response as any)?.data;

          // A rejected operation can still come back as HTTP 2xx with a
          // `{ success: false, message, error }` envelope. Axios resolves these,
          // so without this check the mutation is treated as a success and the
          // backend's message never reaches `onError`.
          if (isFailureEnvelope(data)) {
            const failure: any = new Error(extractApiErrorMessage({ response }));
            failure.response = response;
            failure.isApiFailure = true;
            throw failure;
          }

          return data;
        },

        onSuccess: (res: any, variables: TVariables, context: any) => {
          // Toast
          if (variables.toast !== false) {
            globalOnSuccess((res as any)?.message || 'Success!');
          }

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
          if (variables.toast !== false) {
            globalOnError(extractApiErrorMessage(error));
          }
          (customOnError as any)?.(error, variables, context);
        },
      });
    };

    const post = createMutation('post');
    const put = createMutation('put');
    const del = createMutation('delete');
    const patch = createMutation('patch');

    return {
      /** @deprecated kept for compatibility; always `false` */
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
