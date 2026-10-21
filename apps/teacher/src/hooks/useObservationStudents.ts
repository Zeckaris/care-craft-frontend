import { useMemo } from 'react';
import { useSectionRosters } from '@/hooks/useSectionRoster';

export interface ObservationStudent {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  sectionIds: string[];
}

function sortStudents(a: ObservationStudent, b: ObservationStudent): number {
  const byLast = a.lastName.localeCompare(b.lastName);
  if (byLast !== 0) return byLast;
  return a.firstName.localeCompare(b.firstName);
}

export function useObservationStudents(
  sectionIds: string[],
  enabled = true,
) {
  const {
    enrollments,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSectionRosters(sectionIds, enabled);

  const students = useMemo(() => {
    const byId = new Map<string, ObservationStudent>();

    for (const enrollment of enrollments) {
      const student = enrollment.studentId;
      if (!student?._id) continue;

      const sectionId = enrollment.sectionId?._id;
      const existing = byId.get(student._id);

      if (existing) {
        if (sectionId && !existing.sectionIds.includes(sectionId)) {
          existing.sectionIds.push(sectionId);
        }
        continue;
      }

      byId.set(student._id, {
        _id: student._id,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        sectionIds: sectionId ? [sectionId] : [],
      });
    }

    return Array.from(byId.values()).sort(sortStudents);
  }, [enrollments]);

  return {
    students,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
