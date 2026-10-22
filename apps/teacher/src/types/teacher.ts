/**
 * Teacher-specific API types.
 * Derived from the API contract; do not add shapes not in the contract.
 */

/** A subject the teacher is assigned to teach (from GET /section/my). */
export interface TeacherSubject {
  _id: string;
  name: string;
  description?: string | null;
}

/** A grade document (populated from the section's gradeId). */
export interface SectionGrade {
  _id: string;
  /** Stored as a free string by the backend ("1", "Grade 1", "KG"). */
  level: number | string;
  description?: string | null;
}

/** The section object inside a MySection item. */
export interface MySection {
  _id: string;
  gradeId: SectionGrade;
  schoolYear: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One entry from GET /section/my */
export interface MySectionItem {
  section: MySection;
  isHomeroom: boolean;
  subjects: TeacherSubject[];
  studentCount: number;
}

/** Shape of GET /section/my success response data */
export type MySectionsData = MySectionItem[];
