/**
 * Shared error classification for offline-sync transports.
 *
 * API wrappers throw a `SyncRequestError` whose `kind` tells the queue manager
 * how to react:
 *   network — no response (offline / DNS / timeout)      → retry with backoff
 *   server  — 5xx, 408 or 429                             → retry with backoff
 *   auth    — 401 (session expired)                       → pause, never fail
 *   client  — other 4xx or a `success:false` envelope     → do not retry
 */

export type SyncRequestErrorKind = 'network' | 'server' | 'auth' | 'client';

export class SyncRequestError extends Error {
  kind: SyncRequestErrorKind;
  status?: number;

  constructor(message: string, kind: SyncRequestErrorKind, status?: number) {
    super(message);
    this.name = 'SyncRequestError';
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Pulls a human-readable message out of any error shape the backend produces.
 * Handles the success wrapper (`{ success, message, data, error }`), a bare
 * middleware error (`{ message }`), a string body, and a plain `Error`.
 */
export function extractErrorMessage(error: unknown, fallback = 'Request failed'): string {
  const err = error as
    | { response?: { data?: unknown }; message?: string }
    | undefined;

  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (data && typeof data === 'object') {
    const body = data as { message?: unknown; error?: unknown };
    if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
    if (
      body.error &&
      typeof body.error === 'object' &&
      typeof (body.error as { message?: unknown }).message === 'string' &&
      (body.error as { message: string }).message.trim()
    ) {
      return (body.error as { message: string }).message.trim();
    }
  }
  if (typeof err?.message === 'string' && err.message.trim()) return err.message.trim();
  return fallback;
}

/** Maps an unknown transport failure to the request-error kind the queue acts on. */
export function classifyRequestError(error: unknown, fallback = 'Request failed'): SyncRequestError {
  if (error instanceof SyncRequestError) return error;

  const status = (error as { response?: { status?: number } })?.response?.status;
  const message = extractErrorMessage(error, fallback);

  if (status == null) return new SyncRequestError(message, 'network');
  if (status === 401) return new SyncRequestError(message, 'auth', status);
  // 408 Request Timeout and 429 Too Many Requests are transient.
  if (status >= 500 || status === 408 || status === 429) {
    return new SyncRequestError(message, 'server', status);
  }
  return new SyncRequestError(message, 'client', status);
}
