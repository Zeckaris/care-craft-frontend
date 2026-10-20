import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CloudOff,
  RefreshCw,
  Save,
  ShieldX,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { useBranding } from '@/context/BrandingContext';
import { useMySections } from '@/hooks/useMySections';
import { useSectionRoster } from '@/hooks/useSectionRoster';
import { useAttributeCategories } from '@/hooks/useAttributeCategories';
import {
  useSaveAttributeEvaluation,
  useStudentAttributeEvaluation,
} from '@/hooks/useAttributeEvaluations';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatSectionLabel } from '@/lib/section';
import { getApiErrorStatus } from '@/lib/api-error';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const SCORES = [1, 2, 3, 4, 5] as const;

export default function AttributeEvaluationPage() {
  const { sectionId, studentId } = useParams<{
    sectionId: string;
    studentId: string;
  }>();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const { refetch: refetchBranding } = useBranding();

  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch: refetchSections,
  } = useMySections();
  const sectionItem = sections.find((item) => item.section._id === sectionId);
  const canAccess = Boolean(sectionId && studentId && sectionItem?.isHomeroom);
  const sectionLabel = formatSectionLabel(sectionItem?.section);

  const {
    enrollments,
    isLoading: rosterLoading,
    error: rosterError,
    refetch: refetchRoster,
  } = useSectionRoster(canAccess ? sectionId : undefined);

  const enrollment = useMemo(
    () => enrollments.find((item) => item.studentId._id === studentId),
    [enrollments, studentId],
  );
  const enrollmentId = enrollment?._id;

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useAttributeCategories();

  const {
    evaluation,
    isLoading: evaluationLoading,
    isError: evaluationIsError,
    error: evaluationError,
    refetch: refetchEvaluation,
  } = useStudentAttributeEvaluation(studentId, enrollmentId);

  const { saveEvaluation, isSaving } = useSaveAttributeEvaluation();

  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [remark, setRemark] = useState('');
  const initializedRef = useRef(false);

  useEffect(() => {
    initializedRef.current = false;
    setScores({});
    setComments({});
    setRemark('');
  }, [sectionId, studentId]);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!canAccess || !enrollment || !enrollmentId) return;
    if (categoriesLoading || categoriesError || evaluationLoading || evaluationIsError) return;

    const nextScores: Record<string, number | null> = {};
    const nextComments: Record<string, string> = {};

    for (const category of categories) {
      const item = evaluation?.attributes.find(
        (attribute) => attribute.attributeId?._id === category._id,
      );
      nextScores[category._id] =
        item && item.score >= 1 && item.score <= 5 ? item.score : null;
      nextComments[category._id] = item?.comment ?? '';
    }

    setScores(nextScores);
    setComments(nextComments);
    setRemark(evaluation?.remark ?? '');
    initializedRef.current = true;
  }, [
    canAccess,
    categories,
    categoriesError,
    categoriesLoading,
    enrollment,
    enrollmentId,
    evaluation,
    evaluationIsError,
    evaluationLoading,
  ]);

  const evaluationErrorStatus = getApiErrorStatus(evaluationError);

  useEffect(() => {
    if (evaluationErrorStatus === 403) refetchBranding();
  }, [evaluationErrorStatus, refetchBranding]);

  const student = enrollment?.studentId;
  const studentDisplayName = student
    ? [student.lastName, student.firstName].filter(Boolean).join(', ')
    : '';

  const scoredCount = categories.filter(
    (category) => scores[category._id] != null,
  ).length;
  const total = categories.reduce(
    (sum, category) => sum + (scores[category._id] ?? 0),
    0,
  );
  const maxTotal = categories.length * 5;
  const allScored = categories.length > 0 && scoredCount === categories.length;
  const canSave = Boolean(
    enrollmentId && studentId && allScored && online && !isSaving,
  );

  const handleSave = async () => {
    if (!canSave || !sectionId || !studentId || !enrollmentId) return;

    const attributes = categories.map((category) => {
      const comment = comments[category._id]?.trim();
      return {
        attributeId: category._id,
        score: scores[category._id] as number,
        ...(comment ? { comment } : {}),
      };
    });

    const trimmedRemark = remark.trim();

    try {
      await saveEvaluation({
        id: evaluation?._id,
        payload: {
          studentId,
          studentEnrollmentId: enrollmentId,
          attributes,
          ...(trimmedRemark ? { remark: trimmedRemark } : {}),
        },
      });
      toast.success('Student attributes saved.');
      navigate(`/app/attributes/${sectionId}`, { replace: true });
    } catch (error) {
      const status = getApiErrorStatus(error);
      const message = extractApiErrorMessage(error);

      if (status === 403) {
        if (/not enabled/i.test(message)) refetchBranding();
        toast.error(message || 'Attribute evaluation is not enabled for this school.');
        return;
      }

      if (status === 400) {
        toast.error(message || 'Please check the scores and try again.');
        return;
      }

      toast.error(message || 'Could not save the evaluation. Please try again.');
    }
  };

  const back = () => navigate(-1);

  if (sectionsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (sectionsError) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load your sections
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {sectionsError}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetchSections()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sectionItem || !sectionItem.isHomeroom) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ShieldX size={28} className="text-[var(--color-danger)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">Not available</p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              Only the homeroom teacher for this section can record student attributes.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/app/attributes', { replace: true })}
            >
              Back to homeroom sections
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (rosterLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (rosterError) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load the roster
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {extractApiErrorMessage(rosterError)}
            </p>
            <Button variant="danger" size="sm" onClick={() => void refetchRoster()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enrollment || !enrollmentId) {
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Student enrollment not found
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              This student is not in the active roster for this section. Return to the roster and
              try again.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/app/attributes/${sectionId}`, { replace: true })}
            >
              Back to roster
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (categoriesLoading || evaluationLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (categoriesError || evaluationIsError) {
    const error = categoriesError ?? evaluationError;
    return (
      <div className="fade-in space-y-4">
        <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not prepare this evaluation
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {extractApiErrorMessage(error)}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (categoriesError) void refetchCategories();
                if (evaluationIsError) void refetchEvaluation();
              }}
            >
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="fade-in space-y-4 pb-24 lg:pb-20">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="-ml-1" onClick={back}>
            <ArrowLeft size={16} /> Back
          </Button>
          {evaluation && <Badge variant="info">Editing saved evaluation</Badge>}
        </div>

        <div>
          <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
            {studentDisplayName || 'Student'}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {sectionLabel} · Student attributes
          </p>
        </div>

        {!online && (
          <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-3 py-2.5 text-xs text-[var(--color-text)]">
            <WifiOff size={15} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
            <span>
              You are offline. Connect to the internet before saving this evaluation.
            </span>
          </div>
        )}

        {categories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
              <Sparkles size={28} className="text-[var(--color-text-muted)]" />
              <p className="text-sm font-semibold text-[var(--color-text)]">
                No attribute categories
              </p>
              <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
                An administrator has not configured student attribute categories yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Total score
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {scoredCount} of {categories.length} categories scored
                  </p>
                </div>
                <p className="text-2xl font-black tabular-nums text-[var(--color-primary)]">
                  {total} <span className="text-base font-semibold text-[var(--color-text-muted)]">/ {maxTotal}</span>
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {categories.map((category) => {
                const selected = scores[category._id] ?? null;
                return (
                  <Card key={category._id}>
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <h2 className="text-sm font-bold text-[var(--color-text)]">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-5 gap-1.5" role="group" aria-label={`${category.name} score`}>
                        {SCORES.map((score) => (
                          <button
                            key={score}
                            type="button"
                            aria-pressed={selected === score}
                            onClick={() =>
                              setScores((current) => ({
                                ...current,
                                [category._id]: score,
                              }))
                            }
                            className={cn(
                              'h-11 rounded-[var(--radius-md)] border text-sm font-bold transition-colors',
                              selected === score
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
                            )}
                          >
                            {score}
                          </button>
                        ))}
                      </div>

                      <div>
                        <textarea
                          value={comments[category._id] ?? ''}
                          onChange={(event) =>
                            setComments((current) => ({
                              ...current,
                              [category._id]: event.target.value,
                            }))
                          }
                          maxLength={200}
                          rows={2}
                          placeholder="Optional comment"
                          aria-label={`${category.name} comment`}
                          className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                        <p className="mt-1 text-right text-[11px] text-[var(--color-text-muted)]">
                          {(comments[category._id] ?? '').length}/200
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardContent className="space-y-1.5 p-4">
                <label
                  htmlFor="attribute-remark"
                  className="text-sm font-bold text-[var(--color-text)]"
                >
                  Overall remark
                </label>
                <textarea
                  id="attribute-remark"
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Optional overall remark"
                  className="w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <p className="text-right text-[11px] text-[var(--color-text-muted)]">
                  {remark.length}/500
                </p>
              </CardContent>
            </Card>

            {!allScored && (
              <p className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <CloudOff size={12} /> Score every category to enable saving.
              </p>
            )}
          </>
        )}
      </div>

      {categories.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom))] z-20 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-nav)] lg:bottom-0 lg:left-64 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-2">
            <Badge variant="neutral" className="shrink-0 tabular-nums">
              {scoredCount}/{categories.length} scored
            </Badge>
            <Button
              className="flex-1"
              disabled={!canSave}
              loading={isSaving}
              onClick={() => void handleSave()}
            >
              <Save size={16} />
              {online ? 'Save evaluation' : 'Connect to save'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
