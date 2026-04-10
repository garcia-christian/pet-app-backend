import { User } from '@domain/entities';
import { passwordCrypto } from '@infrastructure/auth/password';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createUserParamsSchema = z.object({
  googleId: z.string().min(1).nullable().default(null),
  name: z.string().min(1),
  password: z.string().min(6),
  email: z.email(),
  image: z.string().nullable().default(null),
});

export type CreateUserParams = z.input<typeof createUserParamsSchema>;
export type CreateUserResult =
  | {
      type: 'success';
      id: string;
      token: string;
      refreshToken: string;
      tokenExpiresAt: string;
      refreshTokenExpiresAt: string;
    }
  | { type: 'error' };

export async function registerUser(
  params: CreateUserParams,
  { logger, repositories, jwtService }: UseCaseDependencies,
): Promise<CreateUserResult> {
  logger.info('Creating user');

  const validated = createUserParamsSchema.parse(params);

  const hashedPassword = await passwordCrypto.hash(validated.password);

  const user = new User({
    id: crypto.randomUUID(),
    googleId: validated.googleId,
    name: validated.name,
    email: validated.email,
    password: hashedPassword,
    image: validated.image,
  });

  const result = await repositories.usersRepository.create(user);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'User created');
    const userId = result.data?.id ?? '';

    const token = await jwtService.generateAccessToken({
      userId,
      email: validated.email,
    });
    const refreshToken = await jwtService.generateRefreshToken({
      userId,
      email: validated.email,
    });

    const tokenExpiresAt = jwtService.getTokenExpiresAt(token);
    const refreshTokenExpiresAt = jwtService.getTokenExpiresAt(refreshToken);

    return {
      type: 'success',
      id: userId,
      token,
      refreshToken,
      tokenExpiresAt: tokenExpiresAt?.toISOString() ?? '',
      refreshTokenExpiresAt: refreshTokenExpiresAt?.toISOString() ?? '',
    };
  }

  if (result.error) logger.error('Failed to create user');
  return { type: 'error' };
}
