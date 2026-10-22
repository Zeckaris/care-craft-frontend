/**
 * Grades API binding for the teacher app.
 *
 * Binds the shared `@carecraft/grades` API factory to this app's axios client,
 * and exposes the offline queue's transport (which sends only the wire fields).
 */
import { createGradesApi, type GradesPostClient } from '@carecraft/grades';
import { apiClient } from '@/services/api-client';

export const gradesApi = createGradesApi(apiClient);

/** Transport used by the offline queue: one stage's records at a time. */
export const postMarks: GradesPostClient = async (ctx, records) => {
  const data = await gradesApi.writeMarks({
    sectionId: ctx.sectionId,
    subjectId: ctx.subjectId,
    academicTermId: ctx.academicTermId,
    assessmentTypeId: ctx.assessmentTypeId,
    records,
  });
  return data.results;
};
