import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const refreshParamsSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenParams = z.input<typeof refreshParamsSchema>;

export type RefreshTokenResult =
  | {
      type: 'success';
      token: string;
      refreshToken: string;
      tokenExpiresAt: string;
      refreshTokenExpiresAt: string;
    }
  | { type: 'invalid_token' }
  | { type: 'user_not_found' }
  | { type: 'error' };

export async function refreshToken(
  params: RefreshTokenParams,
  { logger, repositories, jwtService }: UseCaseDependencies,
): Promise<RefreshTokenResult> {
  logger.info('Refreshing access token');

  const validated = refreshParamsSchema.parse(params);

  const payload = await jwtService.verifyRefresh(validated.refreshToken);
  if (!payload) {
    logger.warn({}, 'Invalid refresh token');
    return { type: 'invalid_token' };
  }
  const userId = payload.userId;

  if (!userId) {
    logger.warn({}, 'Refresh token missing userId');
    return { type: 'invalid_token' };
  }
  const userResult = await repositories.usersRepository.findById(userId);

  if (!userResult || !userResult.ok || !userResult.data) {
    logger.warn({ userId }, 'User not found for refresh token');
    return { type: 'user_not_found' };
  }

  const user = userResult.data;

  const token = await jwtService.generateAccessToken({ userId: user.id, email: user.email });
  const refresh = await jwtService.generateRefreshToken({ userId: user.id, email: user.email });

  const tokenExpiresAt = jwtService.getTokenExpiresAt(token);
  const refreshTokenExpiresAt = jwtService.getTokenExpiresAt(refresh);

  return {
    type: 'success',
    token,
    refreshToken: refresh,
    tokenExpiresAt: tokenExpiresAt?.toISOString() ?? '',
    refreshTokenExpiresAt: refreshTokenExpiresAt?.toISOString() ?? '',
  };
}
