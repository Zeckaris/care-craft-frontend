/**
 * Admin useCurrentUser hook.
 * Delegates to the shared `makeUseCurrentUser` factory from `@carecraft/auth-hooks`.
 */
import { makeUseCurrentUser } from '@carecraft/auth-hooks';
import { useApi } from '@/hooks/useApi';

export const useCurrentUser = makeUseCurrentUser(useApi);