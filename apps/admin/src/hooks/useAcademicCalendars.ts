import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { IAcademicCalendar } from '@carecraft/types';
import { useApi } from '@/hooks/useApi';
import { toSchoolDate } from '@/utils/schoolDate';

export type { IAcademicCalendar };

export interface AcademicCalendarInput {
  academicYear: string;
  startDate: string;
  endDate: string;
  registrationStartDate?: string | null;
  registrationEndDate?: string | null;
  newStudentRegistrationStartDate?: string | null;
  newStudentRegistrationEndDate?: string | null;
  holidayDates?: string[];
}

export const useAcademicCalendars = () => {
  const queryClient = useQueryClient();
  const { get, post, put, del, postMutation, putMutation, deleteMutation } = useApi();

  const urlPath = '/calendar';
  const queryKey = [urlPath];

  const {
    data: raw,
    isLoading,
    isError,
    error,
    refetch,
  } = get(urlPath, {
    queryKey,
    staleTime: 60_000,
  });

  const calendars: IAcademicCalendar[] = raw?.success
    ? (raw.data as IAcademicCalendar[])
    : [];

  const currentCalendar = calendars.find((calendar) => calendar.isCurrent) ?? null;

  // Derived values from the current calendar (used by enrollment UI).
  const today = toSchoolDate(new Date());

  const regStart = currentCalendar?.registrationStartDate
    ? toSchoolDate(currentCalendar.registrationStartDate)
    : null;

  const newRegEnd = currentCalendar?.newStudentRegistrationEndDate
    ? toSchoolDate(currentCalendar.newStudentRegistrationEndDate)
    : null;

  const isEnrollmentOpen =
    !!currentCalendar &&
    (!regStart || today >= regStart) &&
    (!newRegEnd || today <= newRegEnd);

  const formatWindowDate = (date: string | null) =>
    date ? dayjs(date).format('MMMM D, YYYY') : 'N/A';

  const registrationWindowText = currentCalendar
    ? `${formatWindowDate(regStart)} — ${formatWindowDate(newRegEnd)}`
    : 'No active calendar set';

  const invalidateAcademicData = () => {
    queryClient.invalidateQueries({ queryKey: ['/calendar'] });
    queryClient.invalidateQueries({ queryKey: ['/calendar/current'] });
    queryClient.invalidateQueries({ queryKey: ['/calendar/current-context'] });
    queryClient.invalidateQueries({ queryKey: ['/term'] });
    queryClient.invalidateQueries({ queryKey: ['/term/current'] });
  };

  const create = async (data: AcademicCalendarInput) => {
    const result = await post({ url: urlPath, body: data });
    invalidateAcademicData();
    return result;
  };

  const update = async (id: string, data: Partial<AcademicCalendarInput>) => {
    const result = await put({ url: `${urlPath}/${id}`, body: data });
    invalidateAcademicData();
    return result;
  };

  const remove = async (id: string) => {
    const result = await del({ url: `${urlPath}/${id}` });
    invalidateAcademicData();
    return result;
  };

  return {
    calendars,
    currentCalendar,

    isEnrollmentOpen,
    registrationWindowText,

    isLoading,
    isError,
    error,
    refetch,

    create,
    update,
    remove,

    isCreating: postMutation.isPending,
    isUpdating: putMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
