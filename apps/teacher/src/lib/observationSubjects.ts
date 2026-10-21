import type { MySectionItem, TeacherSubject } from '@/types/teacher';

export function uniqueSubjects(sections: MySectionItem[]): TeacherSubject[] {
  const byId = new Map<string, TeacherSubject>();

  for (const item of sections) {
    for (const subject of item.subjects) {
      if (!byId.has(subject._id)) byId.set(subject._id, subject);
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function subjectsForSectionIds(
  sections: MySectionItem[],
  sectionIds: string[],
): TeacherSubject[] {
  if (sectionIds.length === 0) return [];
  const sectionSet = new Set(sectionIds);
  return uniqueSubjects(
    sections.filter((item) => sectionSet.has(item.section._id)),
  );
}
