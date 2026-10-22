import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Info,
  RefreshCw,
  ShieldX,
  UserX,
} from 'lucide-react';
import type { StudentBadge } from '@carecraft/types';
import { extractApiErrorMessage } from '@carecraft/query-core';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { useMySections } from '@/hooks/useMySections';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSectionRoster } from '@/hooks/useSectionRoster';
import {
  useStudentBadgeProgress,
  useStudentBadgeGiftMutation,
} from '@/hooks/useBadgeProgress';
import { useEligibleBadges } from '@/hooks/useEligibleBadges';
import {
  useBadgeAwardMutations,
  useStudentBadgesForTerm,
} from '@/hooks/useStudentBadges';
import { formatSectionLabel } from '@/lib/section';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { AwardBadgeSheet } from '@/components/badges/AwardBadgeSheet';
import { AwardedBadgeItem } from '@/components/badges/AwardedBadgeItem';
import { BadgeOfflineBanner } from '@/components/badges/BadgeOfflineBanner';
import { EditAwardNoteModal } from '@/components/badges/EditAwardNoteModal';
import { InProgressBadges } from '@/components/badges/InProgressBadges';
import { MarkGiftGivenModal } from '@/components/badges/MarkGiftGivenModal';
import { RevokeAwardModal } from '@/components/badges/RevokeAwardModal';
import { UndoGiftModal } from '@/components/badges/UndoGiftModal';

function fullName(first?: string, middle?: string, last?: string): string {
  return [first, middle, last].filter(Boolean).join(' ');
}

function initials(first?: string, last?: string): string {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
}

function isForbidden(error: unknown): boolean {
  const candidate = error as
    | { status?: number; response?: { status?: number } }
    | undefined;
  return (
    candidate?.status === 403 || candidate?.response?.status === 403
  );
}

function giftActionError(error: unknown, fallback: string): string {
  const message = extractApiErrorMessage(error);
  if (isForbidden(error)) {
    if (message && /homeroom/i.test(message)) return message;
    return 'Only the homeroom teacher can update gift status for this student.';
  }
  return message || fallback;
}

export default function BadgeStudentPage() {
  const { sectionId, studentId } = useParams<{
    sectionId: string;
    studentId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const online = useOnlineStatus();

  const {
    sections,
    isLoading: sectionsLoading,
    error: sectionsError,
    refetch: refetchSections,
  } = useMySections();

  const sectionItem = sections.find((item) => item.section._id === sectionId);
  const canAccess = Boolean(sectionId && sectionItem?.isHomeroom);
  const sectionLabel = formatSectionLabel(sectionItem?.section);

  const {
    enrollments,
    isLoading: rosterLoading,
    error: rosterError,
    refetch: refetchRoster,
  } = useSectionRoster(canAccess ? sectionId : undefined);

  const enrollment = useMemo(
    () =>
      enrollments.find((item) => item.studentId._id === studentId) ?? null,
    [enrollments, studentId],
  );
  const student = enrollment?.studentId ?? null;
  const studentName = student
    ? fullName(student.firstName, student.middleName, student.lastName)
    : '';
  const studentInitials = student
    ? initials(student.firstName, student.lastName)
    : '';

  const progressStudentId =
    online && canAccess && enrollment ? studentId : undefined;
  const {
    data: progress,
    isLoading: progressLoading,
    isFetching: progressFetching,
    error: progressError,
    refetch: refetchProgress,
  } = useStudentBadgeProgress(progressStudentId);

  const termId = progress?.academicTerm?._id;
  const {
    awards,
    isLoading: awardsLoading,
    isFetching: awardsFetching,
    error: awardsError,
    refetch: refetchAwards,
  } = useStudentBadgesForTerm(
    online && canAccess && enrollment && termId ? studentId : undefined,
    termId,
  );

  const {
    badges,
    isLoading: badgesLoading,
    error: badgesError,
    refetch: refetchBadges,
  } = useEligibleBadges(
    online && canAccess ? sectionItem?.section.gradeId._id : undefined,
  );

  const {
    awardBadge,
    updateAwardNote,
    revokeBadge,
    isAwarding,
    isUpdating,
    isRevoking,
  } = useBadgeAwardMutations();

  const {
    mutateAsync: updateGiftStatus,
    isPending: isUpdatingGift,
  } = useStudentBadgeGiftMutation();

  const [awardOpen, setAwardOpen] = useState(false);
  const [editAward, setEditAward] = useState<StudentBadge | null>(null);
  const [revokeAward, setRevokeAward] = useState<StudentBadge | null>(null);
  const [markGiftAward, setMarkGiftAward] = useState<StudentBadge | null>(null);
  const [undoGiftAward, setUndoGiftAward] = useState<StudentBadge | null>(null);

  useEffect(() => {
    if (online) return;
    setAwardOpen(false);
    setEditAward(null);
    setRevokeAward(null);
    setMarkGiftAward(null);
    setUndoGiftAward(null);
  }, [online]);

  const awardedBadgeIds = useMemo(
    () =>
      new Set(
        awards
          .map((award) => award.badgeId?._id)
          .filter((id): id is string => Boolean(id)),
      ),
    [awards],
  );

  const availableBadges = useMemo(
    () => badges.filter((badge) => !awardedBadgeIds.has(badge._id)),
    [awardedBadgeIds, badges],
  );

  const canEditAward = (award: StudentBadge) =>
    award.source === 'teacher' &&
    Boolean(user?.id) &&
    award.awardedBy?._id === user?.id;

  const canRevokeAward = (award: StudentBadge) => award.source !== 'system';

  const awardActionDisabled =
    !online ||
    awardsLoading ||
    Boolean(awardsError) ||
    Boolean(progressError);

  const handleAward = async (badgeId: string, note: string) => {
    if (!studentId) return;
    try {
      const result = await awardBadge({
        badgeId,
        studentId,
        note: note || undefined,
      });
      toast.success(result?.message || 'Badge awarded.');
      setAwardOpen(false);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error) || 'Could not award this badge.',
      );
      throw error;
    }
  };

  const handleSaveNote = async (note: string | null) => {
    if (!editAward) return;
    try {
      const result = await updateAwardNote(editAward._id, note);
      toast.success(result?.message || 'Note updated.');
      setEditAward(null);
    } catch (error) {
      toast.error(extractApiErrorMessage(error) || 'Could not update the note.');
      throw error;
    }
  };

  const handleRevoke = async () => {
    if (!revokeAward) return;
    try {
      const result = await revokeBadge(revokeAward._id);
      toast.success(result?.message || 'Badge award revoked.');
      setRevokeAward(null);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(error) || 'Could not revoke this badge.',
      );
      throw error;
    }
  };

  const canManageGift = online && Boolean(sectionItem?.isHomeroom);

  const handleMarkGiftGiven = async (note?: string) => {
    if (!markGiftAward) return;
    try {
      await updateGiftStatus({
        awardId: markGiftAward._id,
        given: true,
        note,
      });
      toast.success('Gift marked as given.');
      setMarkGiftAward(null);
    } catch (error) {
      toast.error(
        giftActionError(error, 'Could not update the gift status.'),
      );
      throw error;
    }
  };

  const handleUndoGift = async () => {
    if (!undoGiftAward) return;
    try {
      await updateGiftStatus({
        awardId: undoGiftAward._id,
        given: false,
      });
      toast.success('Gift status undone.');
      setUndoGiftAward(null);
    } catch (error) {
      toast.error(
        giftActionError(error, 'Could not update the gift status.'),
      );
      throw error;
    }
  };

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-1"
          onClick={() =>
            navigate(sectionId ? `/app/badges/${sectionId}` : '/app/badges')
          }
        >
          <ArrowLeft size={16} /> Back
        </Button>
        {online && progressFetching && !progressLoading && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <RefreshCw size={12} className="animate-spin" /> Updating
          </span>
        )}
      </div>

      {!online && <BadgeOfflineBanner />}

      {sectionsLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : sectionsError ? (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load your sections
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {sectionsError}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => void refetchSections()}
            >
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : !sectionItem || !sectionItem.isHomeroom ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ShieldX size={28} className="text-[var(--color-danger)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Not available
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              Only the homeroom teacher for this section can award student
              badges.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/app/badges', { replace: true })}
            >
              Back to homeroom sections
            </Button>
          </CardContent>
        </Card>
      ) : rosterLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : rosterError ? (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load the roster
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">
              {extractApiErrorMessage(rosterError) ||
                'Please try again.'}
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => void refetchRoster()}
            >
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : !enrollment || !student ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <UserX size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Student not found
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              This student is not in the section roster.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() =>
                navigate(
                  sectionId ? `/app/badges/${sectionId}` : '/app/badges',
                )
              }
            >
              Back to students
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
              {studentInitials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-black tracking-tight text-[var(--color-text)]">
                {studentName}
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {sectionLabel}
              </p>
              <p className="mt-0.5 text-xs font-medium text-[var(--color-text-muted)]">
                {!online
                  ? 'School year and term unavailable offline'
                  : progress
                    ? `${progress.schoolYear} | ${progress.academicTerm.name}`
                    : progressError
                      ? 'School year and term unavailable'
                      : 'Loading school year and term'}
              </p>
            </div>
            <Badge variant="homeroom">Homeroom</Badge>
          </div>

          {!online ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Badge details need a connection
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Reconnect to view this student's awards and progress.
                </p>
              </CardContent>
            </Card>
          ) : progressLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : progressError ? (
            <Card className="border-[var(--color-warning)] bg-[var(--color-warning-light)]">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Info
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--color-warning)]">
                      Badge progress unavailable
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-warning)] opacity-90">
                      {extractApiErrorMessage(progressError) ||
                        'Please try again.'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => void refetchProgress()}
                >
                  <RefreshCw size={14} /> Retry
                </Button>
              </CardContent>
            </Card>
          ) : progress ? (
            <>
              <Card className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                      <Award size={20} />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-[var(--color-text)]">
                        Award a badge
                      </h2>
                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                        Choose a badge enabled for this section's grade.
                      </p>
                      {awardsError && (
                        <p className="mt-1 text-[11px] text-[var(--color-warning)]">
                          Existing awards could not be loaded, so new awards are
                          paused.
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={awardActionDisabled}
                    onClick={() => setAwardOpen(true)}
                  >
                    <Award size={16} />
                    Award badge
                  </Button>
                </div>
              </Card>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text)]">
                      Awarded this term
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {awardsLoading
                        ? 'Loading awards'
                        : awardsError
                          ? 'Unable to load awards'
                          : `${awards.length} badge${awards.length === 1 ? '' : 's'} awarded`}
                    </p>
                  </div>
                  {awardsFetching && !awardsLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <RefreshCw size={12} className="animate-spin" />{' '}
                      Refreshing
                    </span>
                  )}
                </div>

                {awardsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : awardsError ? (
                  <Card className="border-[var(--color-warning)] bg-[var(--color-warning-light)]">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold text-[var(--color-warning)]">
                        Could not load badge awards
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-warning)] opacity-90">
                        {extractApiErrorMessage(awardsError) ||
                          'Please try again.'}
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={() => void refetchAwards()}
                      >
                        <RefreshCw size={14} /> Retry
                      </Button>
                    </CardContent>
                  </Card>
                ) : awards.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        No badges awarded this term
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        Award a badge to recognize this student.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {awards.map((award) => (
                      <AwardedBadgeItem
                        key={award._id}
                        award={award}
                        canEdit={canEditAward(award)}
                        canRevoke={canRevokeAward(award)}
                        canManageGift={canManageGift}
                        onEdit={setEditAward}
                        onRevoke={setRevokeAward}
                        onMarkGiftGiven={setMarkGiftAward}
                        onUndoGift={setUndoGiftAward}
                      />
                    ))}
                  </div>
                )}
              </section>

              <InProgressBadges items={progress.badges} />
            </>
          ) : null}

          <AwardBadgeSheet
            open={awardOpen}
            onOpenChange={setAwardOpen}
            badges={availableBadges}
            isLoading={badgesLoading}
            error={badgesError}
            isPending={isAwarding}
            onRetry={() => void refetchBadges()}
            onAward={handleAward}
          />
          <EditAwardNoteModal
            open={Boolean(editAward)}
            onOpenChange={(open) => {
              if (!open) setEditAward(null);
            }}
            award={editAward}
            isPending={isUpdating}
            onSave={handleSaveNote}
          />
          <RevokeAwardModal
            open={Boolean(revokeAward)}
            onOpenChange={(open) => {
              if (!open) setRevokeAward(null);
            }}
            award={revokeAward}
            isPending={isRevoking}
            onConfirm={handleRevoke}
          />
          <MarkGiftGivenModal
            open={Boolean(markGiftAward)}
            onOpenChange={(open) => {
              if (!open) setMarkGiftAward(null);
            }}
            award={markGiftAward}
            isPending={isUpdatingGift}
            onSave={handleMarkGiftGiven}
          />
          <UndoGiftModal
            open={Boolean(undoGiftAward)}
            onOpenChange={(open) => {
              if (!open) setUndoGiftAward(null);
            }}
            award={undoGiftAward}
            isPending={isUpdatingGift}
            onConfirm={handleUndoGift}
          />
        </>
      )}
    </div>
  );
}
