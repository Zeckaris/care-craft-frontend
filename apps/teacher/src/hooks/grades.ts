/**
 * Teacher grades query hooks.
 *
 * Binds the shared `@carecraft/grades` hook factory to the app's API client so
 * pages import familiar hooks without duplicating query logic.
 */
import { createGradesHooks } from '@carecraft/grades';
import { gradesApi } from '@/services/grades-api';

export const { useCurrentTerm, useTerms, useClassSheet } = createGradesHooks(gradesApi);
