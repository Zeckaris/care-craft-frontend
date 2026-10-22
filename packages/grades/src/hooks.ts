/**
 * Grades query hooks, created from the app-supplied API binding.
 *
 * The class sheet and discovery data are ordinary persisted TanStack queries, so
 * once opened online they remain readable offline (the app persists the cache).
 */
import { useQuery } from '@tanstack/react-query';
import type { AcademicTerm, AssessmentResultsData, ClassSheetData } from '@carecraft/types';
import type { GradesApi } from './api';
import { gradesKeys } from './keys';

export function createGradesHooks(api: GradesApi) {
  function useCurrentTerm() {
    return useQuery<AcademicTerm | null>({
      queryKey: gradesKeys.currentTerm(),
      queryFn: () => api.fetchCurrentTerm(),
      staleTime: 5 * 60_000,
      retry: 1,
    });
  }

  function useTerms() {
    return useQuery<AcademicTerm[]>({
      queryKey: gradesKeys.terms(),
      queryFn: () => api.fetchTerms(),
      staleTime: 10 * 60_000,
      retry: 1,
    });
  }

  function useClassSheet(sectionId?: string, subjectId?: string, academicTermId?: string) {
    return useQuery<ClassSheetData>({
      queryKey: gradesKeys.classSheet(sectionId ?? '', subjectId ?? '', academicTermId ?? ''),
      queryFn: () => api.fetchClassSheet(sectionId as string, subjectId as string, academicTermId),
      enabled: Boolean(sectionId && subjectId),
      staleTime: 30_000,
      retry: 1,
      refetchOnReconnect: true,
    });
  }

  /**
   * The read-only results sheet for admins and coordinators. Requires a term
   * because the endpoint must never silently fall back to the current term when
   * the section belongs to a past school year.
   */
  function useResults(sectionId?: string, subjectId?: string, academicTermId?: string) {
    return useQuery<AssessmentResultsData>({
      queryKey: gradesKeys.results(sectionId ?? '', subjectId ?? '', academicTermId ?? ''),
      queryFn: () => api.fetchResults(sectionId as string, subjectId as string, academicTermId),
      enabled: Boolean(sectionId && subjectId && academicTermId),
      staleTime: 30_000,
      retry: 1,
      refetchOnReconnect: true,
    });
  }

  return { useCurrentTerm, useTerms, useClassSheet, useResults };
}
