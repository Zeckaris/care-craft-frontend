/**
 * Assessments API binding for the admin app.
 *
 * Binds the shared `@carecraft/grades` API factory to this app's axios client.
 * It exposes the read-only results sheet and the reopen action used by
 * coordinators and admins, plus the shared term lookups.
 */
import { createGradesApi } from '@carecraft/grades';
import { apiClient } from '@/services/api-client';

export const assessmentsApi = createGradesApi(apiClient);
