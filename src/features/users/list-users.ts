import type { User } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';

export type ListUsersResult = { type: 'success'; users: User[] } | { type: 'error' };

export async function listUsers({ logger, repositories }: UseCaseDependencies): Promise<ListUsersResult> {
  logger.info('Listing users');

  const result = await repositories.usersRepository.findAll();

  if (result.ok) {
    return { type: 'success', users: result.data ?? [] };
  }

  logger.error('Failed to list users');
  return { type: 'error' };
}
