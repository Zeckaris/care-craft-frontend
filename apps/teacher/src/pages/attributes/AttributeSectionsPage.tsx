import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ClipboardList, RefreshCw } from 'lucide-react';
import { useMySections } from '@/hooks/useMySections';
import { formatSectionLabel } from '@/lib/section';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function AttributeSectionsPage() {
  const navigate = useNavigate();
  const { sections, isLoading, error, refetch } = useMySections();

  const homeroomSections = useMemo(
    () => sections.filter((item) => item.isHomeroom),
    [sections],
  );

  useEffect(() => {
    if (isLoading || homeroomSections.length !== 1) return;
    navigate(`/app/attributes/${homeroomSections[0].section._id}`, { replace: true });
  }, [homeroomSections, isLoading, navigate]);

  const autoRedirecting = !isLoading && homeroomSections.length === 1;

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-1"
          onClick={() => navigate('/app/home')}
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          Student attributes
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Choose a homeroom section to evaluate its students.
        </p>
      </div>

      {isLoading || autoRedirecting ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <Card className="border-[var(--color-danger)] bg-[var(--color-danger-light)]">
          <CardContent className="p-6 text-center">
            <p className="mb-1 text-sm font-bold text-[var(--color-danger)]">
              Could not load your sections
            </p>
            <p className="mb-4 text-xs text-[var(--color-danger)] opacity-80">{error}</p>
            <Button variant="danger" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={14} /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : homeroomSections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ClipboardList size={28} className="text-[var(--color-text-muted)]" />
            <p className="text-sm font-semibold text-[var(--color-text)]">
              No homeroom sections
            </p>
            <p className="max-w-xs text-xs text-[var(--color-text-secondary)]">
              Student attributes are available to homeroom teachers. You are not assigned as a
              homeroom teacher for any section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {homeroomSections.map((item) => (
            <button
              key={item.section._id}
              type="button"
              onClick={() => navigate(`/app/attributes/${item.section._id}`)}
              className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-raised)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-text)]">
                  {formatSectionLabel(item.section)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {item.studentCount} student{item.studentCount !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="homeroom">Homeroom</Badge>
                <ChevronRight size={18} className="text-[var(--color-text-muted)]" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
