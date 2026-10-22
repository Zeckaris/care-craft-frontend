import { useGrades } from '@/hooks/useGrades';
import { useSubjects } from '@/hooks/useSubjects';
import { useSections } from '@/hooks/useSections';
import { useTeacherPicker } from '@/hooks/useTeacherPicker';

/**
 * Resolves schedule entity ids to display names using the existing list hooks.
 * Shared by the summary, drift report and publish flows, which all render
 * id-only payloads.
 */
export const useScheduleNames = (schoolYear?: string) => {
  const { grades } = useGrades();
  const { subjects } = useSubjects();
  const { sections } = useSections({ schoolYear, pageSize: 1000 });
  const { teachers } = useTeacherPicker();

  const gradeName = (id: string | undefined | null): string =>
    (id && grades.find((g) => g._id === id)?.level) || (id ?? '');

  const sectionName = (id: string | undefined | null): string =>
    (id && sections.find((s) => s._id === id)?.name) || (id ?? '');

  const subjectName = (id: string | undefined | null): string =>
    (id && subjects.find((s) => s._id === id)?.name) || (id ?? '');

  const teacherName = (id: string | undefined | null): string => {
    if (!id) return '';
    const teacher = teachers.find((t) => t._id === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : id;
  };

  /** Grade name for a section id, via the section's grade reference. */
  const gradeNameForSection = (sectionId: string | undefined | null): string => {
    if (!sectionId) return '';
    const gradeId = sections.find((s) => s._id === sectionId)?.gradeId?._id;
    return gradeId ? gradeName(gradeId) : '';
  };

  return {
    grades,
    sections,
    subjects,
    teachers,
    gradeName,
    sectionName,
    subjectName,
    teacherName,
    gradeNameForSection,
  };
};
