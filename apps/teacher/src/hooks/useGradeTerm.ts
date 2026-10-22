/**
 * useGradeTerm — resolves the term to grade for a section.
 *
 * Defaults to the current term when it belongs to the section's school year,
 * otherwise the teacher is asked to pick one from the terms for that year.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AcademicTerm } from '@carecraft/types';
import { useCurrentTerm, useTerms } from '@/hooks/grades';

export function useGradeTerm(schoolYear: string | undefined) {
  const currentQuery = useCurrentTerm();
  const termsQuery = useTerms();
  const [termId, setTermId] = useState<string | undefined>(undefined);
  const previousYear = useRef(schoolYear);

  const terms = useMemo<AcademicTerm[]>(
    () => (termsQuery.data ?? []).filter((t) => t.calendarId.academicYear === schoolYear),
    [termsQuery.data, schoolYear],
  );

  // Clear the selection when the section (and so the year) changes.
  useEffect(() => {
    if (previousYear.current !== schoolYear) {
      previousYear.current = schoolYear;
      setTermId(undefined);
    }
  }, [schoolYear]);

  // Pick a sensible default once terms/current term are known.
  useEffect(() => {
    if (termId || !schoolYear) return;
    const current = currentQuery.data;
    if (current && current.calendarId.academicYear === schoolYear) {
      setTermId(current._id);
    } else if (terms.length === 1) {
      setTermId(terms[0]._id);
    }
  }, [termId, schoolYear, currentQuery.data, terms]);

  const currentTerm = currentQuery.data ?? null;

  return {
    termId,
    setTermId,
    terms,
    currentTerm,
    currentTermId: currentTerm?._id ?? null,
    isLoadingTerms: currentQuery.isLoading || termsQuery.isLoading,
    termsError: termsQuery.error ?? currentQuery.error,
    refetchTerms: () => {
      void termsQuery.refetch();
      void currentQuery.refetch();
    },
  };
}
