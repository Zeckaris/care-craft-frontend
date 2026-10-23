/**
 * @carecraft/auth-hooks
 *
 * Shared authentication hooks:
 *   • useCurrentUser  — fetches /auth/me and surfaces the logged-in user
 *   • makeUseLogin    — factory for a login hook (antd-free, router-free)
 *   • makeUseLogout   — factory for a logout hook (antd-free, router-free)
 *
 * DESIGN
 * ──────
 * These hooks never import antd or react-router-dom.
 * Instead they accept callbacks (onSuccess, onError, onNavigate) so each app
 * can plug in whatever toast / navigation mechanism it uses.
 *
 * ADMIN USAGE
 * ───────────
 * // In apps/admin/src/hooks/useLogin.ts:
 * import { makeUseLogin } from '@carecraft/auth-hooks';
 * import { message } from 'antd';
 * import { useApi } from '@/hooks/useApi';   // bound to admin's apiClient
 *
 * export const useLogin = makeUseLogin(useApi, {
 *   onSuccess: (msg) => message.success(msg),
 *   onInfo:    (msg) => message.info(msg),
 *   onError:   (msg) => message.error(msg),   // or just setError
 * });
 *
 * // In apps/admin/src/hooks/useLogout.ts:
 * import { makeUseLogout } from '@carecraft/auth-hooks';
 * import { message } from 'antd';
 * import { useNavigate } from 'react-router-dom';
 * export const useLogout = makeUseLogout(useApi, {
 *   onLoggedOut: (navigate) => {
 *     message.info('You have been logged out');
 *     navigate('/signin', { replace: true });
 *   },
 * });
 */

import { useState } from 'react';
import type { AuthUser } from '@carecraft/types';
import { capitalizeFirstLetter, clearUser } from '@carecraft/utils';

// ---------------------------------------------------------------------------
// Demo accounts
// ---------------------------------------------------------------------------

export type DemoAccountApp = 'admin' | 'teacher';

export interface DemoCredentials {
  email: string;
  password: string;
}

const DEMO_PASSWORD = 'pass@123word';

/**
 * Demo sign-in credentials shared by the admin and teacher apps.
 * Kept here as the single source of truth so both apps stay in sync.
 */
export const DEMO_CREDENTIALS: Record<DemoAccountApp, DemoCredentials> = {
  admin: {
    email: 'test@example.com',
    password: DEMO_PASSWORD,
  },
  teacher: {
    email: 'mulugeta.abera@kidusmikael.edu.et',
    password: DEMO_PASSWORD,
  },
};

/**
 * Fills a login form with the demo credentials for `app`.
 * The caller owns the form library, so it passes an `apply` callback.
 */
export function fillDemoAccount(
  app: DemoAccountApp,
  apply: (credentials: DemoCredentials) => void,
): DemoCredentials {
  const credentials = DEMO_CREDENTIALS[app];
  apply(credentials);
  return credentials;
}

// We accept a generic `useApi` function rather than importing it so the hook
// is not coupled to a specific Axios instance.
type UseApiFn = () => {
  get: (url: string, options?: Record<string, unknown>) => any;
  post: (vars: { url: string; body?: unknown; toast?: boolean }) => Promise<any>;
};

// ---------------------------------------------------------------------------
// useCurrentUser
// ---------------------------------------------------------------------------

/**
 * Fetches the current authenticated user from `/auth/me`.
 * Returns `null` when not logged in (401 is not retried).
 *
 * @param useApi  The bound useApi hook from the consuming app.
 */
export function makeUseCurrentUser(useApi: UseApiFn) {
  return function useCurrentUser() {
    const { get } = useApi();

    const { data: rawData, isLoading: queryLoading, refetch } = get('/auth/me', {
      retry: false,
      staleTime: 5 * 60 * 1000,
    });

    const user: AuthUser | null = rawData?.success ? rawData.data : null;
    const error: string | null = rawData && !rawData.success ? rawData.message : null;

    return {
      user,
      isLoading: queryLoading,
      error,
      refetch,
    };
  };
}

// ---------------------------------------------------------------------------
// useLogin
// ---------------------------------------------------------------------------

export interface LoginCallbacks {
  /** Called when login succeeds and the user is populated. */
  onSuccess?: (message: string) => void;
  /** Called when MFA is required (before the second submit). */
  onMfaRequired?: (message: string) => void;
  /** Sets or clears the local error state (replaces antd message for errors). */
  onError?: (message: string) => void;
  /** Optional: called with the full user payload on success so the app can
   *  update its user context. */
  onUserResolved?: (user: AuthUser) => void;
}

/**
 * Factory that returns a `useLogin` hook bound to the app's `useApi`.
 *
 * The hook itself is router-free and antd-free — it surfaces callbacks
 * for every UI side-effect.
 */
export function makeUseLogin(useApi: UseApiFn, callbacks: LoginCallbacks = {}) {
  return function useLogin() {
    const { post, postMutation } = useApi() as any;
    const [error, setError] = useState<string | null>(null);

    const {
      onSuccess,
      onMfaRequired,
      onError,
      onUserResolved,
    } = callbacks;

    const login = async (email: string, password: string, mfaCode?: string) => {
      setError(null);
      try {
        const body = mfaCode ? { email, password, mfaCode } : { email, password };
        const res = await post({ url: '/auth/signin', body, toast: false });

        if (res.success && res.error?.mfaRequired) {
          onMfaRequired?.('A verification code has been sent to your email.');
          return { mfaRequired: true };
        }

        if (res.success) {
          const { firstName, role, email: userEmail, _id } = res.data.user;
          const formattedName = capitalizeFirstLetter(firstName);

          const resolvedUser: AuthUser = {
            id: _id,
            firstName: formattedName,
            role,
            email: userEmail,
          };

          onUserResolved?.(resolvedUser);
          onSuccess?.(res.message || 'Login successful!');
          return res.data.user;
        }

        const msg =
          res.message?.toLowerCase().includes('invalid email or password')
            ? 'Invalid email or password. Please try again.'
            : res.message || 'Login failed. Please try again.';

        setError(msg);
        onError?.(msg);
        return null;
      } catch (err: any) {
        const backendMsg = err?.response?.data?.message;
        const msg =
          backendMsg?.toLowerCase().includes('invalid email or password')
            ? 'Invalid email or password. Please try again.'
            : backendMsg || 'Login failed. Please try again.';

        setError(msg);
        onError?.(msg);
        return null;
      }
    };

    return {
      login,
      loading: postMutation.isPending as boolean,
      error,
      setError,
    };
  };
}

// ---------------------------------------------------------------------------
// useLogout
// ---------------------------------------------------------------------------

export interface LogoutCallbacks {
  /**
   * Called after the backend logout request completes (or fails).
   * The app is responsible for showing a toast and navigating away.
   */
  onLoggedOut?: () => void;
}

/**
 * Factory that returns a `useLogout` hook bound to the app's `useApi`.
 *
 * The hook clears localStorage and calls `onLoggedOut` — it does NOT call
 * navigate or show antd toasts itself.
 */
export function makeUseLogout(useApi: UseApiFn, callbacks: LogoutCallbacks = {}) {
  return function useLogout() {
    const { post } = useApi();

    const logout = async () => {
      try {
        await post({ url: '/auth/signout', toast: false });
      } catch {
        console.warn('Backend logout failed, proceeding locally');
      } finally {
        clearUser();
        callbacks.onLoggedOut?.();
      }
    };

    return { logout };
  };
}
