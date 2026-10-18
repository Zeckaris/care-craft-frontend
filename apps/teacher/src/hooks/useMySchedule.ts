/**
 * useMySchedule: fetches GET /schedule/my for the teacher's own timetable.
 *
 * The school year is resolved from the teacher's sections (see
 * `resolveSchoolYear`); when there are none, the request is skipped and the
 * caller shows the "no lessons assigned" empty state. The query is persisted
 * by the app's IndexedDB cache and keyed per teacher + year, so it stays
 * readable offline and can never leak between accounts.
 */
import { useMemo } from 'react';
import type { AxiosError } from 'axios';
import type { IMyScheduleData } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { useApi } from '@/hooks/useApi';
import { useUser } from '@/context/UserContext';
import { useMySections } from '@/hooks/useMySections';
import { myScheduleQueryKey } from '@/lib/query-keys';
import { resolveSchoolYear } from '@/lib/mySchedule';

interface MyScheduleEnvelope {
  success: boolean;
  data: IMyScheduleData;
  message?: string;
  error?: unknown;
}

export type MyScheduleStatus =
  | 'loading'
  | 'no-sections'
  | 'not-published'
  | 'error'
  | 'ready';

export function useMySchedule() {
  const { get } = useApi();
  const { user } = useUser();
  const { sections, isLoading: sectionsLoading } = useMySections();

  const schoolYear = useMemo(() => resolveSchoolYear(sections), [sections]);

  const url = schoolYear
    ? `/schedule/my?schoolYear=${encodeURIComponent(schoolYear)}`
    : '/schedule/my';

  const query = get<MyScheduleEnvelope>(url, {
    queryKey: myScheduleQueryKey(user?.id ?? 'anonymous', schoolYear ?? 'none'),
    enabled: Boolean(user?.id && schoolYear),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const data = query.data?.success ? (query.data.data ?? null) : null;

  let status: MyScheduleStatus;
  if (query.error) {
    const statusCode = (query.error as AxiosError).response?.status;
    status = statusCode === 404 ? 'not-published' : 'error';
  } else if (data) {
    status = 'ready';
  } else if (sectionsLoading || query.isLoading) {
    status = 'loading';
  } else if (!schoolYear) {
    status = 'no-sections';
  } else {
    status = 'loading';
  }

  return {
    data,
    status,
    schoolYear,
    errorMessage: status === 'error' ? extractApiErrorMessage(query.error) : null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
