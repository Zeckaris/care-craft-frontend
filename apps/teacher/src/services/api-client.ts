/**
 * Teacher app — API client singleton.
 *
 * Binds the shared createApiClient factory to this app's env vars.
 */
import { createApiClient } from '@carecraft/api-client';

const { apiClient, ASSETS_BASE } = createApiClient({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:5000/api',
  assetsBase: (import.meta.env.VITE_ASSETS_BASE as string) ?? 'http://localhost:5000',
});

export { apiClient, ASSETS_BASE };
