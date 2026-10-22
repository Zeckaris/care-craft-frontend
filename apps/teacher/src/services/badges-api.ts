import { createBadgesApi } from '@carecraft/badges';
import { apiClient } from '@/services/api-client';

export const badgesApi = createBadgesApi(apiClient);
