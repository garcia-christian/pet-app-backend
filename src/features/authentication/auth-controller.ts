import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { getCurrentUser } from './get-current-user';
import { loginUser } from './login-user';
import { logoutUser } from './logout-user';
import { refreshToken } from './refresh-token';
import { registerUser } from './register-user';

export default async function userController(fastify: FastifyInstance) {
  fastify.route<{
    Body: { googleId: string; name: string; email: string; image?: string | null; password: string };
  }>({
    method: 'POST',
    url: '/api/v1/auth/register',
    schema: {
      summary: 'Create a new user',
      tags: ['authentication'],
      response: {
        201: {
          description: 'User created',
          type: 'object',
          properties: {
            id: { type: 'string' },
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            tokenExpiresAt: { type: 'string', format: 'date-time' },
            refreshTokenExpiresAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'token', 'refreshToken', 'tokenExpiresAt', 'refreshTokenExpiresAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await registerUser(
        {
          googleId: request.body.googleId,
          name: request.body.name,
          password: request.body.password,
          email: request.body.email,
          image: request.body.image ?? null,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id, token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt }) =>
          reply.status(201).send({ id, token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route({
    method: 'POST',
    url: '/api/v1/auth/login',
    schema: {
      summary: 'Login user',
      tags: ['authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            tokenExpiresAt: { type: 'string', format: 'date-time' },
            refreshTokenExpiresAt: { type: 'string', format: 'date-time' },
          },
          required: ['token', 'refreshToken', 'tokenExpiresAt', 'refreshTokenExpiresAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return reply.status(401).header('WWW-Authenticate', 'Basic realm="Login"').send({
          message: 'Missing or invalid Authorization header',
          statusCode: 401,
        });
      }

      const credentials = parseBasicAuth(authHeader);

      if (!credentials) {
        return reply.status(401).header('WWW-Authenticate', 'Basic realm="Login"').send({
          message: 'Invalid Basic Authorization format',
          statusCode: 401,
        });
      }

      const result = await loginUser(credentials, fastify.dependencies);

      return match(result)
        .with({ type: 'success' }, ({ token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt }) =>
          reply.status(200).send({ token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt }),
        )
        .with({ type: 'invalid_credentials' }, () =>
          reply
            .status(401)
            .header('WWW-Authenticate', 'Basic realm="Login"')
            .send({ message: 'Invalid email or password', statusCode: 401 }),
        )
        .with({ type: 'user_not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{
    Body: { refreshToken: string };
  }>({
    method: 'POST',
    url: '/api/v1/auth/refresh',
    schema: {
      summary: 'Refresh access token',
      tags: ['authentication'],
      body: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        required: ['refreshToken'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            tokenExpiresAt: { type: 'string', format: 'date-time' },
            refreshTokenExpiresAt: { type: 'string', format: 'date-time' },
          },
          required: ['token', 'refreshToken', 'tokenExpiresAt', 'refreshTokenExpiresAt'],
        },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await refreshToken({ refreshToken: request.body.refreshToken }, fastify.dependencies);

      return match(result)
        .with({ type: 'success' }, ({ token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt }) =>
          reply.status(200).send({ token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt }),
        )
        .with({ type: 'invalid_token' }, () =>
          reply.status(401).send({ message: 'Invalid refresh token', statusCode: 401 }),
        )
        .with({ type: 'user_not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /auth/me — return current user from JWT
  fastify.route({
    method: 'GET',
    url: '/api/v1/auth/me',
    schema: {
      summary: 'Get current authenticated user',
      tags: ['authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            image: { type: 'string', nullable: true },
            householdId: { type: 'string', nullable: true },
          },
          required: ['id', 'name'],
        },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const result = await getCurrentUser({ userId: request.currentUser!.userId }, fastify.dependencies);

      return match(result)
        .with({ type: 'success' }, ({ user }) => reply.status(200).send(user))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // POST /auth/logout — invalidate session
  fastify.route({
    method: 'POST',
    url: '/api/v1/auth/logout',
    schema: {
      summary: 'Logout user',
      tags: ['authentication'],
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'boolean' },
          },
        },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (_request, reply) => {
      const result = await logoutUser(fastify.dependencies);

      return match(result)
        .with({ type: 'success' }, () => reply.status(200).send({ data: true }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}

function parseBasicAuth(authorization: string) {
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
