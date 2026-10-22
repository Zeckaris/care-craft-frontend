/**
 * useGradeSubjects
 *
 * Fetches the subjects linked to a specific grade via the GSA route:
 *   GET /assessment/gsa/grade/:level
 *
 * The grade level string (e.g. "Grade 5") is URL-encoded before sending.
 */
import { useApi } from '@/hooks/useApi';

export interface IGradeSubject {
  subjectId: {
    _id: string;
    name: string;
  };
}

export const useGradeSubjects = (gradeLevel?: string) => {
  const { get } = useApi();

  const encodedLevel = gradeLevel ? encodeURIComponent(gradeLevel) : null;
  const url = encodedLevel ? `/assessment/gsa/grade/${encodedLevel}` : null;

  const { data: raw, isLoading, isError } = get(url ?? '', {
    queryKey: ['/assessment/gsa/grade', gradeLevel],
    staleTime: 60_000,
    enabled: !!encodedLevel,
  });

  // API returns { success, data: { gsas: [ { subjectId: { _id, name } } ] } }
  const gsas: IGradeSubject[] = raw?.success ? (raw.data?.gsas ?? []) : [];

  return { gsas, isLoading, isError };
};
