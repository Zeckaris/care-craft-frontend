import { useMatches, type UIMatch } from 'react-router-dom';

// Define interface for match with handle
interface CrumbMatch extends UIMatch {
  handle?: {
    crumb?: ((data?: any) => string) | string;
  };
}

export const useBreadcrumb = (): string[] => {
  const matches = useMatches() as CrumbMatch[];

  const crumbs = matches
    .filter((match): match is CrumbMatch & { handle: { crumb: Function | string } } => {
      const crumb = match.handle?.crumb;
      return typeof crumb === 'function' || typeof crumb === 'string';
    })
    .map(match => {
      const crumb = match.handle!.crumb!;
      return typeof crumb === 'function' ? crumb(match.data) : crumb;
    });

  return crumbs
};