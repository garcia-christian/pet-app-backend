import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const loginUserParamsSchema = z.object({
  basicAuth: z.string(),
});

export type LoginUserParams = z.input<typeof loginUserParamsSchema>;

export type LoginUserResult =
  | { type: 'success'; token: string }
  | { type: 'invalid_credentials' }
  | { type: 'user_not_found' }
  | { type: 'invalid_basic_auth' }
  | { type: 'error' };

export async function loginUser(
  params: LoginUserParams,
  { logger, repositories, passwordCrypto, jwtService }: UseCaseDependencies,
): Promise<LoginUserResult> {
  logger.info('Attempting user login');

  const credentials = parseBasicAuth(params.basicAuth);

  if (!credentials) {
    logger.warn({}, 'Invalid Basic Authorization header');
    return { type: 'invalid_basic_auth' };
  }

  const user = await repositories.usersRepository.findByEmail(credentials.email);

  if (!user) {
    logger.warn({ email: credentials.email }, 'User not found');
    return { type: 'user_not_found' };
  }

  if (!user.password) {
    logger.warn({ email: credentials.email }, 'User has no password set');
    return { type: 'invalid_credentials' };
  }

  const isPasswordValid = await passwordCrypto.verify(credentials.password, user.password);

  if (!isPasswordValid) {
    logger.warn({ email: credentials.email }, 'Invalid password');
    return { type: 'invalid_credentials' };
  }
  logger.info({ email: credentials.email }, 'Password verified successfully');

  const token = await jwtService.generate({
    userId: user.id,
    email: user.email,
  });
  logger.info({ userId: user.id }, 'User logged in successfully');
  return { type: 'success', token };
}

function parseBasicAuth(authorization: string | undefined) {
  if (!authorization?.startsWith('Basic ')) {
    return null;
  }
  try {
    const base64Credentials = authorization.slice(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return null;
    }

    return { email, password };
  } catch {
    return null;
  }
}
