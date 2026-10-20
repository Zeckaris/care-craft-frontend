/**
 * BrandingContext — provides runtime school branding for the Teacher app.
 *
 * Requirements:
 *  - Seed synchronously from cached copy to prevent default theme flash.
 *  - Fetch GET /general/school-info/branding when authenticated.
 *  - Apply branding by driving runtime CSS variables and injecting Google Fonts.
 *  - Update browser meta theme-color.
 *  - Gracefully handle offline states.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  applyBranding,
  getCachedBranding,
  setCachedBranding,
  resolveLogoUrl,
  DEFAULT_THEME,
  DEFAULT_FONT,
  type BrandingInfo,
} from '@carecraft/branding';
import { useUser } from '@/context/UserContext';
import { apiClient, ASSETS_BASE } from '@/services/api-client';
import { BRANDING_QUERY_KEY } from '@/lib/query-keys';

interface BrandingContextValue {
  branding: BrandingInfo | null;
  isLoading: boolean;
  refetch: () => void;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user, sessionKey } = useUser();
  const isAuthenticated = !!user;

  // Initialize state from synchronous cache if available
  const [branding, setBranding] = useState<BrandingInfo | null>(() => {
    const cached = getCachedBranding();
    if (cached?.theme || cached?.fontFamily) {
      return {
        name: cached.name || 'CareCraft',
        logo: cached.logo || null,
        theme: cached.theme || DEFAULT_THEME,
        fontFamily: cached.fontFamily || DEFAULT_FONT,
      };
    }
    return null;
  });

  // Always fetch branding fresh: never persisted, never served stale by the
  // service worker. `staleTime: 0` + `refetchOnMount: 'always'` guarantee a
  // network request on every app load once authenticated.
  //
  // NOTE: Custom Cache-Control or Pragma request headers must NOT be sent here
  // because they trigger CORS preflight checks that backend CORS rejects.
  const {
    data: rawData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<{ success: boolean; data: BrandingInfo; message?: string }>({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () =>
      apiClient
        .get('/general/school-info/branding')
        .then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
  });

  // Refresh when the app regains focus or becomes visible again.
  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const onForegroundOrOnline = () => {
      if (document.visibilityState === 'visible' || navigator.onLine) refresh();
    };
    document.addEventListener('visibilitychange', onForegroundOrOnline);
    window.addEventListener('focus', onForegroundOrOnline);
    window.addEventListener('online', onForegroundOrOnline);
    return () => {
      document.removeEventListener('visibilitychange', onForegroundOrOnline);
      window.removeEventListener('focus', onForegroundOrOnline);
      window.removeEventListener('online', onForegroundOrOnline);
    };
  }, [isAuthenticated, refresh]);

  // Refetch when the user finishes logging in (or switches accounts)
  useEffect(() => {
    if (isAuthenticated) {
      void refetch();
    }
  }, [isAuthenticated, sessionKey, refetch]);

  // When the request fails, log a clear console warning while keeping any cached branding applied
  useEffect(() => {
    if (isError && error) {
      const axiosErr = error as { response?: { status?: number; data?: unknown }; message?: string };
      const statusSuffix = axiosErr.response?.status ? ` (HTTP ${axiosErr.response.status})` : '';
      console.warn(
        `[Branding] Failed to fetch school branding from /general/school-info/branding${statusSuffix}:`,
        error,
      );
    }
  }, [isError, error]);

  // When network data arrives, update tokens and cache
  useEffect(() => {
    if (rawData?.success && rawData.data) {
      const serverBranding = rawData.data;
      const theme = serverBranding.theme || DEFAULT_THEME;
      const fontFamily = serverBranding.fontFamily || DEFAULT_FONT;
      const resolvedLogo = resolveLogoUrl(serverBranding.logo, ASSETS_BASE);

      const resolved: BrandingInfo = {
        name: serverBranding.name || 'CareCraft',
        logo: resolvedLogo,
        theme,
        fontFamily,
      };

      setBranding(resolved);

      // Apply runtime design tokens and font to the document
      applyBranding({
        theme: resolved.theme,
        fontFamily: resolved.fontFamily,
        updateMetaThemeColor: true,
        semanticTokens: true,
      });

      // Update synchronous cache in localStorage as the no-flash seed
      setCachedBranding(resolved);
    }
  }, [rawData]);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refetch: refresh }}>
      {children}
    </BrandingContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return ctx;
}
