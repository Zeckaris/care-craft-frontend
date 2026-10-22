/**
 * Admin API client.
 *
 * Creates a singleton Axios instance using the shared `@carecraft/api-client`
 * factory, passing in the Vite env variables for this app.
 *
 * Other apps will create their own instance with their own env vars.
 */
import { createApiClient } from '@carecraft/api-client';

const { apiClient, ASSETS_BASE } = createApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  assetsBase: import.meta.env.VITE_ASSETS_BASE as string,
});

export { apiClient, ASSETS_BASE };
