import { useEffect, useMemo, useState } from 'react';
import { CloudOff, Save, Send, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { schoolToday } from '@carecraft/attendance';
import type { AcademicTerm, IObservation } from '@carecraft/types';
import type { MySectionItem } from '@/types/teacher';
import {
  useObservationMutations,
  type ObservationCreateInput,
  type ObservationUpdateInput,
} from '@/hooks/useObservations';
import type { ObservationStudent } from '@/hooks/useObservationStudents';
import { subjectsForSectionIds } from '@/lib/observationSubjects';
import { useUser } from '@/context/UserContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/observations/SearchableSelect';

const DRAFT_PREFIX = 'carecraft:observation-draft:';
const DESCRIPTION_MAX = 1000;
const NO_SECTION_IDS: string[] = [];
const OFFLINE_MESSAGE =
  'You are offline. Your draft is saved on this device. Connect to the internet to save it.';

interface FormValues {
  studentId: string;
  date: string;
  subjectId: string;
  description: string;
}

interface FieldErrors {
  studentId?: string;
  date?: string;
  subjectId?: string;
  description?: string;
}

interface ObservationFormModalProps {
  mode: 'create' | 'edit';
  observation?: IObservation;
  preselectedStudentId?: string;
  students: ObservationStudent[];
  studentsLoading?: boolean;
  sections: MySectionItem[];
  currentTerm: AcademicTerm | null;
  termLoading?: boolean;
  online: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function readDraft(key: string): FormValues | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FormValues>;
    if (
      typeof parsed.studentId !== 'string' ||
      typeof parsed.date !== 'string' ||
      typeof parsed.description !== 'string'
    ) {
      return null;
    }
    return {
      studentId: parsed.studentId,
      date: parsed.date,
      subjectId:
        typeof parsed.subjectId === 'string' ? parsed.subjectId : '',
      description: parsed.description,
    };
  } catch {
    return null;
  }
}

function writeDraft(key: string, values: FormValues): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // A full or unavailable storage must never block the form.
  }
}

function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

function studentLabel(student: ObservationStudent): string {
  return `${student.firstName} ${student.lastName}`;
}

export function ObservationFormModal({
  mode,
  observation,
  preselectedStudentId,
  students,
  studentsLoading = false,
  sections,
  currentTerm,
  termLoading = false,
  online,
  onClose,
  onSaved,
}: ObservationFormModalProps) {
  const { user } = useUser();
  const isEdit = mode === 'edit';
  const today = schoolToday();
  const draftOwner = user?.id ?? 'anonymous';
  const draftKey = isEdit
    ? `${DRAFT_PREFIX}${draftOwner}:edit:${observation?._id ?? ''}`
    : `${DRAFT_PREFIX}${draftOwner}:new:${preselectedStudentId ?? 'any'}`;

  const { createObservation, updateObservation, isSaving } =
    useObservationMutations();

  const [initial] = useState(() => {
    const fallback: FormValues = isEdit && observation
      ? {
          studentId: observation.studentId?._id ?? '',
          date: observation.date.slice(0, 10),
          subjectId: observation.subjectId?._id ?? '',
          description: observation.description ?? '',
        }
      : {
          studentId: preselectedStudentId ?? '',
          date: today,
          subjectId: '',
          description: '',
        };

    const stored = readDraft(draftKey);
    return {
      fallback,
      values: stored ?? fallback,
      restored: Boolean(stored),
    };
  });

  const [values, setValues] = useState<FormValues>(initial.values);
  const [hasDraft, setHasDraft] = useState(initial.restored);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasDraft) return;
    writeDraft(draftKey, values);
  }, [draftKey, hasDraft, values]);

  const termStart = currentTerm?.startDate?.slice(0, 10) ?? '';
  const termEnd = currentTerm?.endDate?.slice(0, 10) ?? '';
  const maxDate = termEnd && termEnd < today ? termEnd : today;

  const selectedStudent = students.find(
    (student) => student._id === values.studentId,
  );
  const editStudent = observation?.studentId;
  const studentName = isEdit
    ? editStudent
      ? `${editStudent.firstName} ${editStudent.lastName}`
      : 'Unknown student'
    : selectedStudent
      ? studentLabel(selectedStudent)
      : '';

  const studentSectionIds = selectedStudent?.sectionIds ?? NO_SECTION_IDS;
  const availableSubjects = useMemo(
    () => subjectsForSectionIds(sections, studentSectionIds),
    [sections, studentSectionIds],
  );
  const hasSingleSubject = availableSubjects.length === 1;
  const hasMultipleSubjects = availableSubjects.length > 1;

  useEffect(() => {
    setValues((current) => {
      if (hasSingleSubject) {
        const subjectId = availableSubjects[0]._id;
        return current.subjectId === subjectId
          ? current
          : { ...current, subjectId };
      }
      if (!current.subjectId) return current;
      if (
        !availableSubjects.some((subject) => subject._id === current.subjectId)
      ) {
        return { ...current, subjectId: '' };
      }
      return current;
    });
  }, [availableSubjects, hasSingleSubject]);

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student._id,
        label: studentLabel(student),
        hint:
          student.sectionIds.length > 1
            ? `${student.sectionIds.length} sections`
            : undefined,
      })),
    [students],
  );

  const subjectOptions = useMemo(
    () =>
      availableSubjects.map((subject) => ({
        value: subject._id,
        label: subject.name,
      })),
    [availableSubjects],
  );

  const updateValues = (patch: Partial<FormValues>) => {
    setValues((current) => ({ ...current, ...patch }));
    setHasDraft(true);
    setSaveError(null);
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch) as Array<keyof FormValues>) {
        delete next[key];
      }
      return next;
    });
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!values.studentId) errors.studentId = 'Select a student.';
    if (!values.date) {
      errors.date = 'Choose a date.';
    } else if (values.date > today) {
      errors.date = 'Date cannot be in the future.';
    } else if (!currentTerm) {
      errors.date = 'No current academic term is available.';
    } else if (termStart && values.date < termStart) {
      errors.date = 'Date must fall within the current academic term.';
    } else if (termEnd && values.date > termEnd) {
      errors.date = 'Date must fall within the current academic term.';
    }

    if (hasMultipleSubjects && !values.subjectId) {
      errors.subjectId = 'Choose a subject.';
    }

    const description = values.description.trim();
    if (!description) {
      errors.description = 'Add a short description.';
    } else if (description.length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const subjectId = hasSingleSubject
      ? availableSubjects[0]._id
      : hasMultipleSubjects
        ? values.subjectId || undefined
        : undefined;

    const commonPayload: ObservationUpdateInput = {
      date: values.date,
      description: values.description.trim(),
      ...(subjectId ? { subjectId } : {}),
    };

    setFieldErrors({});
    setSaveError(null);
    writeDraft(draftKey, values);
    setHasDraft(true);

    try {
      if (isEdit && observation) {
        await updateObservation(observation._id, commonPayload);
      } else {
        const payload: ObservationCreateInput = {
          studentId: values.studentId,
          ...commonPayload,
        };
        await createObservation(payload);
      }

      clearDraft(draftKey);
      toast.success(isEdit ? 'Observation updated.' : 'Observation shared.');
      onSaved();
    } catch (error) {
      const message = extractApiErrorMessage(error);
      if (/subjectId is required/i.test(message)) {
        setFieldErrors((current) => ({ ...current, subjectId: message }));
      }
      if (!online) {
        setSaveError(OFFLINE_MESSAGE);
      } else if (/network error/i.test(message)) {
        setSaveError(
          'Could not reach the server. Your draft is saved on this device.',
        );
      } else {
        setSaveError(message);
      }
    }
  };

  const discardDraft = () => {
    clearDraft(draftKey);
    setValues(initial.fallback);
    setHasDraft(false);
    setFieldErrors({});
    setSaveError(null);
  };

  const canSubmit =
    online && !termLoading && Boolean(currentTerm) && !isSaving;

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={isEdit ? 'Edit observation' : 'New observation'}
      description={
        isEdit
          ? 'Update what the parent sees.'
          : 'Share a quick note about a student.'
      }
    >
      <div className="space-y-4">
        {!online && (
          <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
            <WifiOff size={15} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
            <span>{OFFLINE_MESSAGE}</span>
          </div>
        )}

        {!termLoading && !currentTerm && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-3 py-2.5 text-xs text-[var(--color-danger)]">
            No current academic term is available. Observations cannot be saved
            right now.
          </div>
        )}

        {hasDraft && (
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-info)] bg-[var(--color-info-light)] px-3 py-2 text-xs text-[var(--color-info)]">
            <span className="flex items-center gap-1.5">
              <CloudOff size={14} />
              Draft saved on this device.
            </span>
            <button
              type="button"
              className="shrink-0 font-bold underline"
              onClick={discardDraft}
            >
              Discard
            </button>
          </div>
        )}

        <div>
          <Label htmlFor="observation-student" required>
            Student
          </Label>
          {isEdit ? (
            <div className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2.5">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {studentName}
              </span>
              <Badge variant="neutral">Cannot change</Badge>
            </div>
          ) : (
            <>
              <SearchableSelect
                id="observation-student"
                value={values.studentId}
                onChange={(studentId) =>
                  updateValues({ studentId, subjectId: '' })
                }
                options={studentOptions}
                placeholder="Search all your students"
                ariaLabel="Student"
                loading={studentsLoading}
                invalid={Boolean(fieldErrors.studentId)}
                emptyText="No students found"
              />
              {fieldErrors.studentId && (
                <p className="mt-1 text-xs text-[var(--color-danger)]">
                  {fieldErrors.studentId}
                </p>
              )}
              {!studentsLoading && students.length === 0 && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  No students were found in your current sections.
                </p>
              )}
            </>
          )}
        </div>

        {hasSingleSubject && (
          <div>
            <Label>Subject</Label>
            <div className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2.5">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {availableSubjects[0].name}
              </span>
              <Badge variant="neutral">Auto</Badge>
            </div>
          </div>
        )}

        {hasMultipleSubjects && (
          <div>
            <Label htmlFor="observation-subject" required>
              Subject
            </Label>
            <SearchableSelect
              id="observation-subject"
              value={values.subjectId}
              onChange={(subjectId) => updateValues({ subjectId })}
              options={subjectOptions}
              placeholder="Choose a subject"
              ariaLabel="Subject"
              invalid={Boolean(fieldErrors.subjectId)}
              emptyText="No subjects found"
            />
            {fieldErrors.subjectId && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">
                {fieldErrors.subjectId}
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="observation-date" required>
            Date
          </Label>
          <Input
            id="observation-date"
            type="date"
            value={values.date}
            min={termStart || undefined}
            max={maxDate}
            error={Boolean(fieldErrors.date)}
            onChange={(event) => updateValues({ date: event.target.value })}
          />
          {fieldErrors.date && (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {fieldErrors.date}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="observation-description" required>
            Description
          </Label>
          <textarea
            id="observation-description"
            value={values.description}
            maxLength={DESCRIPTION_MAX}
            rows={4}
            placeholder="What would you like the parent to know?"
            className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            onChange={(event) =>
              updateValues({ description: event.target.value })
            }
          />
          <div className="mt-1 flex items-start justify-between gap-3">
            <span className="text-xs text-[var(--color-danger)]">
              {fieldErrors.description ?? ''}
            </span>
            <span className="ml-auto shrink-0 text-[11px] tabular-nums text-[var(--color-text-muted)]">
              {values.description.length}/{DESCRIPTION_MAX}
            </span>
          </div>
        </div>

        {saveError && (
          <div
            role="alert"
            className="rounded-[var(--radius-md)] border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-3 py-2.5 text-xs text-[var(--color-danger)]"
          >
            {saveError}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={!canSubmit}
            loading={isSaving}
            onClick={() => void handleSubmit()}
          >
            {isEdit ? <Save size={16} /> : <Send size={16} />}
            {isEdit ? 'Save changes' : 'Share with parent'}
          </Button>
        </div>

        <p className="text-center text-xs text-[var(--color-text-secondary)]">
          {isEdit
            ? 'The parent sees the updated note as soon as you save.'
            : "Visible to the student's parent as soon as you save."}
        </p>
      </div>
    </Modal>
  );
}
