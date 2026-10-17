export interface AssignmentStudent {
  firstName: string;
  middleName?: string;
  lastName: string;
  profileImage?: string;
  gender?: "male" | "female" | "other";
}

/** Details of the last real generation run, used only for the capacity hint. */
export interface GenerationInfo {
  gradeId: string;
  schoolYear: string;
  maxSize: number;
}

/** Extracts the message from either the envelope shape or the bare { message } auth/role errors. */
export const getErrorMessage = (err: unknown): string => {
  const e = err as
    | {
        response?: {
          data?: { message?: string; error?: { message?: string } };
        };
        message?: string;
      }
    | undefined;
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error?.message ||
    e?.message ||
    "Request failed"
  );
};

export const getErrorStatus = (err: unknown): number | undefined => {
  const e = err as { response?: { status?: number } } | undefined;
  return e?.response?.status;
};

/** antd validateFields rejects with an object carrying `errorFields`. */
export const isFormValidationError = (err: unknown): boolean =>
  typeof err === "object" && err !== null && "errorFields" in err;

export const studentFullName = (student: AssignmentStudent): string =>
  [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");

/** Loose academic-year comparison ("2024-2025" vs "2024-25"). */
export const sameAcademicYear = (a?: string, b?: string): boolean =>
  !!a && !!b && a.slice(0, 4) === b.slice(0, 4);
