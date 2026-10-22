/**
 * GradesSubjectPickerPage — pick which subject to grade in a section.
 *
 * Only subject-role assignments are gradeable; a homeroom-only section has no
 * subjects and cannot be graded.
 */
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { useMySections } from '@/hooks/useMySections';
import { formatSectionLabel } from '@/lib/section';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function GradesSubjectPickerPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { sections, isLoading } = useMySections();
  const sectionItem = sections.find((s) => s.section._id === sectionId);
  const subjects = sectionItem?.subjects ?? [];
  const sectionLabel = formatSectionLabel(sectionItem?.section);

  return (
    <div className="fade-in space-y-4">
      <Button variant="ghost" size="sm" className="-ml-1" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </Button>

      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          {sectionLabel || 'Section'}
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Choose a subject to open its class sheet.
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
            Loading subjects…
          </CardContent>
        </Card>
      )}

      {!isLoading && subjects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <BookOpen size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              No subjects to grade
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              You are not assigned to teach a subject in this section. Homeroom alone is not enough
              to take grades.
            </p>
          </CardContent>
        </Card>
      )}

      {subjects.length > 0 && (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <button
              key={subject._id}
              type="button"
              onClick={() => navigate(`/app/sections/${sectionId}/grades/${subject._id}`)}
              className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-raised)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text)]">
                  {subject.name}
                </p>
                {subject.description && (
                  <p className="truncate text-xs text-[var(--color-text-muted)]">
                    {subject.description}
                  </p>
                )}
              </div>
              <ChevronRight size={18} className="shrink-0 text-[var(--color-text-muted)]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
