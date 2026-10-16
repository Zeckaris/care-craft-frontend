import { Home, User, type LucideIcon } from 'lucide-react';

export interface NavItemConfig {
  to: string;
  icon: LucideIcon;
  label: string;
  id: string;
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { to: '/app/home', icon: Home, label: 'Home', id: 'nav-home' },
  { to: '/app/profile', icon: User, label: 'Profile', id: 'nav-profile' },
] as const;
