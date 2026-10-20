import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { SchoolFeatures } from '@carecraft/types';
import { useBranding } from '@/context/BrandingContext';
import { Spinner } from '@/components/ui/Spinner';

interface RequireFeatureProps {
  feature: keyof SchoolFeatures;
  children: ReactNode;
}

export function RequireFeature({ feature, children }: RequireFeatureProps) {
  const { features, isLoaded } = useBranding();

  if (!isLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!features[feature]) {
    return <Navigate to="/app/home" replace />;
  }

  return <>{children}</>;
}
