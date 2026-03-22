import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { loginUser } from './login-user';
import { refreshToken } from './refresh-token';
import { registerUser } from './register-user';

export default async function userController(fastify: FastifyInstance) {
  fastify.route<{
    Body: { googleId: string; name: string; email: string; avatarUrl?: string | null; password: string };
  }>({
    method: 'POST',
    url: '/api/v1/auth/register',
    schema: {
      summary: 'Create a new user',
      tags: ['users'],
      response: {
        201: {
          description: 'Shortened URL created',
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
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
          avatarUrl: request.body.avatarUrl ?? null,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(201).send({ id }))
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
          },
          required: ['token', 'refreshToken'],
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
        .with({ type: 'success' }, ({ token, refreshToken }) => reply.status(200).send({ token, refreshToken }))
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

  fastify.route({
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
          },
          required: ['token', 'refreshToken'],
        },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await refreshToken({ refreshToken: (request.body as any).refreshToken }, fastify.dependencies);

      return match(result)
        .with({ type: 'success' }, ({ token, refreshToken }) => reply.status(200).send({ token, refreshToken }))
        .with({ type: 'invalid_token' }, () =>
          reply.status(401).send({ message: 'Invalid refresh token', statusCode: 401 }),
        )
        .with({ type: 'user_not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
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
