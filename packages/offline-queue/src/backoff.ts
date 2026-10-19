/** Base delay for exponential backoff on network / 5xx sync failures. */
export const SYNC_BACKOFF_BASE_MS = 5_000;

/** Maximum delay for exponential backoff. */
export const SYNC_BACKOFF_MAX_MS = 5 * 60_000;

/** Deterministic exponential backoff for network / 5xx failures. */
export function backoffDelayMs(attempts: number): number {
  const safe = Math.max(1, Math.floor(attempts));
  return Math.min(SYNC_BACKOFF_BASE_MS * 2 ** (safe - 1), SYNC_BACKOFF_MAX_MS);
}
