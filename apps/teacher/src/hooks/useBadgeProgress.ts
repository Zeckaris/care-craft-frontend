import { createBadgeHooks } from '@carecraft/badges';
import { badgesApi } from '@/services/badges-api';

export const { useStudentBadgeProgress } = createBadgeHooks(badgesApi);
