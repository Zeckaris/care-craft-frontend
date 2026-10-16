/**
 * SectionCard — displays one section in the teacher's day overview.
 *
 * Requirements:
 *  • Homeroom vs. Subject role prominently displayed
 *  • Grade level, section name, academic year
 *  • Assigned subjects taught by teacher
 *  • Student count
 *  • Prominent "Take attendance" entry action
 *  • Looks great on phone, tablet, and desktop
 */
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { MySectionItem } from '@/types/teacher';
import { formatSectionLabel } from '@/lib/section';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  item: MySectionItem;
  className?: string;
}

export function SectionCard({ item, className }: SectionCardProps) {
  const navigate = useNavigate();
  const { section, isHomeroom, subjects, studentCount } = item;

  const title = formatSectionLabel(section);

  const handleOpenDetail = () => {
    navigate(`/app/sections/${section._id}`);
  };

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-md hover:border-[var(--color-primary)] flex flex-col justify-between',
        className,
      )}
    >
      <CardContent className="p-5 flex flex-col h-full justify-between">
        <div>
          {/* Top row: Grade & Section + Homeroom/Subject Role */}
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {section.schoolYear}
                </span>
                {!section.isActive && (
                  <Badge variant="warning" className="text-[10px] py-0 px-2">Inactive</Badge>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                {title}
              </h3>
            </div>

            {/* Role indicator */}
            <div className="shrink-0">
              {isHomeroom ? (
                <Badge variant="homeroom" className="font-semibold py-1 px-2.5 shadow-2xs">
                  Homeroom
                </Badge>
              ) : (
                <Badge variant="neutral" className="font-medium py-1 px-2.5">
                  Subject
                </Badge>
              )}
            </div>
          </div>

          {/* Subjects taught */}
          {subjects.length > 0 ? (
            <div className="flex items-start gap-2 my-3">
              <BookOpen size={15} className="shrink-0 text-[var(--color-text-muted)] mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {subjects.map((subj) => (
                  <Badge
                    key={subj._id}
                    variant="primary"
                    className="text-xs font-medium"
                  >
                    {subj.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="my-3 text-xs text-[var(--color-text-muted)] italic">
              No specific subjects assigned
            </div>
          )}
        </div>

        {/* Bottom row: Student count + Prominent Take Attendance Action */}
        <div className="pt-4 mt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--color-text-secondary)]">
            <Users size={16} className="shrink-0 text-[var(--color-text-muted)]" />
            <span className="font-medium">{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              id={`section-detail-${section._id}`}
              variant="ghost"
              size="sm"
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-2"
              onClick={handleOpenDetail}
              title="View section details"
            >
              <ArrowUpRight size={15} />
            </Button>

            <Button
              id={`take-attendance-${section._id}`}
              variant="default"
              size="sm"
              className="font-semibold shadow-xs flex items-center gap-1.5"
              onClick={handleOpenDetail}
            >
              <ClipboardCheck size={15} />
              <span>Take Attendance</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
