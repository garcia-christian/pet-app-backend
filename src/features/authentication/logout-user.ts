import type { UseCaseDependencies } from '@infrastructure/di';

export type LogoutUserResult = { type: 'success' } | { type: 'error' };

export async function logoutUser({ logger }: UseCaseDependencies): Promise<LogoutUserResult> {
  // Stateless JWT — no server-side token store to invalidate.
  // This endpoint exists to satisfy the frontend contract.
  // If a token blacklist is added later, invalidation logic goes here.
  logger.info('User logout requested');
  return { type: 'success' };
}
