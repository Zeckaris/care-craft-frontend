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
  const { user } = useUser();
  const isAuthenticated = !!user;

  // Initialize state from synchronous cache if available
  const [branding, setBranding] = useState<BrandingInfo | null>(() => {
    const cached = getCachedBranding();
    if (cached?.theme || cached?.fontFamily) {
      return {
        name: cached.name || 'CareCraft',
        logo: cached.logo || null,
        theme: cached.theme || 'palette-1',
        fontFamily: cached.fontFamily || 'Roboto',
      };
    }
    return null;
  });

  // Always fetch branding fresh: never persisted, never served stale by the
  // service worker. `staleTime: 0` + `refetchOnMount: 'always'` guarantee a
  // network request on every app load once authenticated.
  const {
    data: rawData,
    isLoading,
    refetch,
  } = useQuery<{ success: boolean; data: BrandingInfo; message?: string }>({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () =>
      apiClient
        .get('/general/school-info/branding', {
          // Ask the browser and any intermediary to revalidate rather than
          // serve a cached palette. The backend should also send no-store.
          headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
        })
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
    const onForeground = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('focus', onForeground);
    return () => {
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('focus', onForeground);
    };
  }, [isAuthenticated, refresh]);

  // When network data arrives, update tokens and cache
  useEffect(() => {
    if (rawData?.success && rawData.data) {
      const serverBranding = rawData.data;
      const resolvedLogo = resolveLogoUrl(serverBranding.logo, ASSETS_BASE);

      const resolved: BrandingInfo = {
        name: serverBranding.name || 'CareCraft',
        logo: resolvedLogo,
        theme: serverBranding.theme,
        fontFamily: serverBranding.fontFamily,
      };

      setBranding(resolved);

      // Apply runtime design tokens and font to the document
      applyBranding({
        theme: resolved.theme,
        fontFamily: resolved.fontFamily,
        updateMetaThemeColor: true,
        semanticTokens: true,
      });

      // Update synchronous cache in localStorage
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
