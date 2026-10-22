/**
 * @carecraft/api-client
 *
 * Creates an Axios instance configured with:
 *   - a base URL (passed in at construction time)
 *   - `withCredentials: true` (cookie-based sessions)
 *   - automatic `Content-Type` removal for FormData so the browser sets the
 *     correct multipart boundary, while JSON requests keep `application/json`.
 *
 * Usage:
 *   const { apiClient, ASSETS_BASE } = createApiClient({
 *     baseURL: import.meta.env.VITE_API_BASE_URL,
 *     assetsBase: import.meta.env.VITE_ASSETS_BASE,
 *   });
 */
import axios from 'axios';

export interface ApiClientOptions {
  /** Full base URL for the API, e.g. "https://api.example.com" */
  baseURL: string;
  /** Optional base URL for uploaded assets/files */
  assetsBase?: string;
}

export interface ApiClientResult {
  apiClient: ReturnType<typeof axios.create>;
  /** Convenience reference to the assetsBase option */
  ASSETS_BASE: string;
}

export function createApiClient(options: ApiClientOptions): ApiClientResult {
  const { baseURL, assetsBase = '' } = options;

  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  });

  // For FormData requests, let the browser set `Content-Type` automatically so
  // it can include the correct multipart boundary.  For everything else, keep
  // the explicit JSON header.
  client.interceptors.request.use((config: any) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  });

  return { apiClient: client, ASSETS_BASE: assetsBase };
}
