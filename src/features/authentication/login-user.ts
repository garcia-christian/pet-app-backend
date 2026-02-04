import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const loginUserParamsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginUserParams = z.input<typeof loginUserParamsSchema>;

export type LoginUserResult =
  | { type: 'success'; token: string; userId: string }
  | { type: 'invalid_credentials' }
  | { type: 'user_not_found' }
  | { type: 'error' };

export async function loginUser(
  params: LoginUserParams,
  { logger, repositories, passwordCrypto, jwtService }: UseCaseDependencies,
): Promise<LoginUserResult> {
  logger.info('Attempting user login');

  const validated = loginUserParamsSchema.parse(params);

  const user = await repositories.usersRepository.findByEmail(validated.email);

  if (!user) {
    logger.warn({ email: validated.email }, 'User not found');
    return { type: 'user_not_found' };
  }

  const isPasswordValid = await passwordCrypto.verify(validated.password, user.password ?? '');

  if (!isPasswordValid) {
    logger.warn({ email: validated.email }, 'Invalid password');
    return { type: 'invalid_credentials' };
  }
  logger.info({ email: validated.email }, 'Password verified successfully');

  const token = await jwtService.generate({
    userId: user.id,
    email: user.email,
  });
  logger.info({ userId: user.id }, 'User logged in successfully');

  return { type: 'success', token, userId: user.id };
}
