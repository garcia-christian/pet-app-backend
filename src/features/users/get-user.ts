import type { User } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getUserParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetUserParams = z.input<typeof getUserParamsSchema>;
export type GetUserResult = { type: 'success'; user: User } | { type: 'not_found' } | { type: 'error' };

export async function getUser(
  params: GetUserParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetUserResult> {
  logger.info({ id: params.id }, 'Getting user');

  const validated = getUserParamsSchema.parse(params);

  const result = await repositories.usersRepository.findById(validated.id);

  if (result?.ok && result.data) {
    return { type: 'success', user: result.data };
  }

  if (result?.ok && !result.data) {
    return { type: 'not_found' };
  }

  if (result && !result.ok) logger.error('Failed to get user');
  return { type: 'error' };
}
