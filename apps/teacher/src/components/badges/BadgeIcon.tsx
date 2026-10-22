import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import { resolveBadgeIcon } from '@/lib/badges';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
} as const;

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
} as const;

interface BadgeIconProps {
  icon?: string | null;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function BadgeIcon({
  icon,
  name,
  size = 'md',
  className,
}: BadgeIconProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveBadgeIcon(icon);

  useEffect(() => {
    setFailed(false);
  }, [icon]);

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-primary-light)] text-[var(--color-primary)]',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Award size={iconSizes[size]} />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
