/**
 * Grades API access, bound to an app-supplied axios client.
 *
 * Transport failures are translated into `SyncRequestError` kinds the offline
 * queue understands (network / server / auth / client). Both backend error
 * shapes are handled in one place by `classifyRequestError`:
 *   • the success wrapper `{ success, message, data, error }`
 *   • a bare middleware error `{ message }`
 */
import type { AxiosInstance } from 'axios';
import { classifyRequestError, SyncRequestError } from '@carecraft/offline-queue';
import type {
  AcademicTerm,
  AssessmentResultsData,
  ClassSheetData,
  MarksWriteData,
  MarksWriteInput,
  StageActionData,
  StageActionInput,
} from '@carecraft/types';

/** Re-exported so grades consumers keep a domain-named error class. */
export { SyncRequestError as GradesRequestError };
export type GradesRequestErrorKind = SyncRequestError['kind'];

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: unknown;
}

function unwrap<T>(body: Envelope<T> | undefined, fallback: string): T {
  if (!body || !body.success) {
    throw new SyncRequestError(body?.message ?? fallback, 'client');
  }
  return body.data;
}

export interface GradesApi {
  fetchTerms(): Promise<AcademicTerm[]>;
  fetchCurrentTerm(): Promise<AcademicTerm | null>;
  fetchClassSheet(
    sectionId: string,
    subjectId: string,
    academicTermId?: string,
  ): Promise<ClassSheetData>;
  fetchResults(
    sectionId: string,
    subjectId: string,
    academicTermId?: string,
  ): Promise<AssessmentResultsData>;
  writeMarks(input: MarksWriteInput): Promise<MarksWriteData>;
  conductStage(input: StageActionInput): Promise<StageActionData>;
  completeStage(input: StageActionInput): Promise<StageActionData>;
  reopenStage(input: StageActionInput): Promise<StageActionData>;
}

export function createGradesApi(client: AxiosInstance): GradesApi {
  return {
    async fetchTerms(): Promise<AcademicTerm[]> {
      try {
        const res = await client.get<Envelope<AcademicTerm[]>>('/term');
        return unwrap(res.data, 'Failed to load terms') ?? [];
      } catch (error) {
        throw classifyRequestError(error, 'Failed to load terms');
      }
    },

    async fetchCurrentTerm(): Promise<AcademicTerm | null> {
      try {
        const res = await client.get<Envelope<AcademicTerm | null>>('/term/current');
        return unwrap(res.data, 'Failed to load the current term');
      } catch (error) {
        throw classifyRequestError(error, 'Failed to load the current term');
      }
    },

    async fetchClassSheet(sectionId, subjectId, academicTermId?): Promise<ClassSheetData> {
      try {
        const res = await client.get<Envelope<ClassSheetData>>('/assessment/scores/class-sheet', {
          params: { sectionId, subjectId, ...(academicTermId ? { academicTermId } : {}) },
        });
        return unwrap(res.data, 'Failed to load the class sheet');
      } catch (error) {
        throw classifyRequestError(error, 'Failed to load the class sheet');
      }
    },

    async fetchResults(sectionId, subjectId, academicTermId?): Promise<AssessmentResultsData> {
      try {
        const res = await client.get<Envelope<AssessmentResultsData>>(
          '/assessment/scores/results',
          {
            params: { sectionId, subjectId, ...(academicTermId ? { academicTermId } : {}) },
          },
        );
        return unwrap(res.data, 'Failed to load assessment results');
      } catch (error) {
        throw classifyRequestError(error, 'Failed to load assessment results');
      }
    },

    async writeMarks(input: MarksWriteInput): Promise<MarksWriteData> {
      try {
        const res = await client.post<Envelope<MarksWriteData>>('/assessment/scores/write', input);
        return unwrap(res.data, 'The marks save was rejected');
      } catch (error) {
        throw classifyRequestError(error, 'The marks save failed');
      }
    },

    async conductStage(input: StageActionInput): Promise<StageActionData> {
      try {
        const res = await client.post<Envelope<StageActionData>>(
          '/assessment/scores/conduct',
          input,
        );
        return unwrap(res.data, 'The stage could not be conducted');
      } catch (error) {
        throw classifyRequestError(error, 'The stage could not be conducted');
      }
    },

    async completeStage(input: StageActionInput): Promise<StageActionData> {
      try {
        const res = await client.post<Envelope<StageActionData>>(
          '/assessment/scores/complete',
          input,
        );
        return unwrap(res.data, 'The stage could not be completed');
      } catch (error) {
        throw classifyRequestError(error, 'The stage could not be completed');
      }
    },

    async reopenStage(input: StageActionInput): Promise<StageActionData> {
      try {
        const res = await client.post<Envelope<StageActionData>>(
          '/assessment/scores/reopen',
          input,
        );
        return unwrap(res.data, 'The stage could not be reopened');
      } catch (error) {
        throw classifyRequestError(error, 'The stage could not be reopened');
      }
    },
  };
}
