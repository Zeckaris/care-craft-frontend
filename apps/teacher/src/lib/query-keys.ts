/** Shared React Query keys. */
export const BRANDING_QUERY_KEY = ['school-info', 'branding'] as const;

export const MY_SCHEDULE_QUERY_ROOT = 'my-schedule' as const;

/**
 * Per-teacher, per-year cache key so one account can never read another
 * account's persisted schedule offline.
 */
export function myScheduleQueryKey(teacherId: string, schoolYear: string) {
  return [MY_SCHEDULE_QUERY_ROOT, teacherId, schoolYear] as const;
}
