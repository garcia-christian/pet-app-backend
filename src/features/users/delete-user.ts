import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteUserParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteUserParams = z.input<typeof deleteUserParamsSchema>;
export type DeleteUserResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteUser(
  params: DeleteUserParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteUserResult> {
  logger.info({ id: params.id }, 'Deleting user');

  const validated = deleteUserParamsSchema.parse(params);

  const result = await repositories.usersRepository.delete(validated.id);

  if (result.ok) {
    logger.info({ id: validated.id }, 'User deleted');
    return { type: 'success' };
  }

  if (result.error === 'not_found') {
    return { type: 'not_found' };
  }

  logger.error('Failed to delete user');
  return { type: 'error' };
}
