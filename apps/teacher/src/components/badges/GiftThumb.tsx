import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { resolveGiftImage } from '@/lib/badges';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
} as const;

const iconSizes = {
  sm: 16,
  md: 20,
} as const;

interface GiftThumbProps {
  image?: string | null;
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function GiftThumb({
  image,
  name,
  size = 'sm',
  className,
}: GiftThumbProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveGiftImage(image);

  useEffect(() => {
    setFailed(false);
  }, [image]);

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-success-light)] text-[var(--color-success)]',
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
        <Gift size={iconSizes[size]} />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
