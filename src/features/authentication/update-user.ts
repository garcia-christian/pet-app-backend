import type { User } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const updateUserParamsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  image: z.string().nullable().optional(),
});

export type UpdateUserParams = z.input<typeof updateUserParamsSchema>;
export type UpdateUserResult = { type: 'success'; user: User } | { type: 'not_found' } | { type: 'error' };

export async function updateUser(
  params: UpdateUserParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<UpdateUserResult> {
  logger.info({ id: params.id }, 'Updating user');

  const validated = updateUserParamsSchema.parse(params);
  const { id, ...data } = validated;

  const result = await repositories.usersRepository.update(id, data);

  if (result.ok && result.data) {
    logger.info({ id }, 'User updated');
    return { type: 'success', user: result.data };
  }

  if (!result.ok && result.error === 'not_found') {
    return { type: 'not_found' };
  }

  logger.error('Failed to update user');
  return { type: 'error' };
}
