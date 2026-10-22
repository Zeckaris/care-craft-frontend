/**
 * Assessment results hooks for the admin app.
 *
 * Binds the shared `@carecraft/grades` query hooks to the admin's API client so
 * the results page imports familiar hooks without duplicating query logic.
 */
import { createGradesHooks } from '@carecraft/grades';
import { assessmentsApi } from '@/services/assessments-api';

const { useCurrentTerm, useTerms, useResults } = createGradesHooks(assessmentsApi);

export { useCurrentTerm, useTerms, useResults };
export { assessmentsApi };
