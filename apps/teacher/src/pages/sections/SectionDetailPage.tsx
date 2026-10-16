/**
 * SectionDetailPage — placeholder for a section's detail view.
 *
 * This page is navigated to when a teacher taps a section card.
 * Attendance, roster, and grading features will be built here in future tasks.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, Eye, Construction } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMySections } from '@/hooks/useMySections';

export default function SectionDetailPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const { sections } = useMySections();
  // Only homeroom teachers record attendance; everyone else views it.
  const isHomeroom = sections.find((s) => s.section._id === sectionId)?.isHomeroom ?? false;

  return (
    <div className="px-4 pt-4 pb-2 fade-in">
      <Button
        id="section-back"
        variant="ghost"
        size="sm"
        className="mb-4 -ml-1"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warning-light)] mb-4">
          <Construction size={28} className="text-[var(--color-warning)]" />
        </div>
        <h2 className="text-base font-bold text-[var(--color-text)] mb-2">Coming soon</h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
          Roster and grading views will be built in a later task. Attendance is ready now.
        </p>

        <Button
          id={`section-detail-attendance-${sectionId}`}
          variant="default"
          size="sm"
          className="mt-5 font-semibold"
          onClick={() => navigate(`/app/sections/${sectionId}/attendance`)}
        >
          {isHomeroom ? <ClipboardCheck size={15} /> : <Eye size={15} />}
          {isHomeroom ? 'Take Attendance' : 'View Attendance'}
        </Button>

        <p className="mt-4 text-xs text-[var(--color-text-muted)] font-mono bg-[var(--color-surface-raised)] rounded px-2 py-1">
          Section ID: {sectionId}
        </p>
      </div>
    </div>
  );
}
