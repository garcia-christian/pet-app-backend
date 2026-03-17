import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { loginUser } from './login-user';
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
          },
          required: ['token'],
        },
        400: { $ref: 'ErrorResponse#' },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await loginUser(
        {
          basicAuth: request.headers.authorization || '',
        },
        fastify.dependencies,
      );

      return match(result)
        .with({ type: 'invalid_basic_auth' }, () =>
          reply
            .status(401)
            .header('WWW-Authenticate', 'Basic realm="Login"')
            .send({ message: 'Missing or invalid Authorization header', statusCode: 401 }),
        )
        .with({ type: 'success' }, ({ token }) => reply.status(200).send({ token }))
        .with({ type: 'invalid_credentials' }, () =>
          reply
            .status(401)
            .header('WWW-Authenticate', 'Basic realm="Login"')
            .send({ message: 'Missing or invalid Authorization header', statusCode: 401 }),
        )
        .with({ type: 'user_not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
