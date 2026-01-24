import { User } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createUserParamsSchema = z.object({
  googleId: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  avatarUrl: z.string().nullable().default(null),
});

export type CreateUserParams = z.input<typeof createUserParamsSchema>;
export type CreateUserResult = { type: 'success'; id: string } | { type: 'error' };

export async function createUser(
  params: CreateUserParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateUserResult> {
  logger.info('Creating user');

  const validated = createUserParamsSchema.parse(params);

  const user = new User({
    id: crypto.randomUUID(),
    googleId: validated.googleId,
    name: validated.name,
    email: validated.email,
    avatarUrl: validated.avatarUrl,
  });

  const result = await repositories.usersRepository.create(user);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'User created');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to create user');
  return { type: 'error' };
}
