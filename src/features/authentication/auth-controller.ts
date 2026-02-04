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
  fastify.route<{
    Body: { email: string; password: string };
  }>({
    method: 'POST',
    url: '/api/v1/auth/login',
    schema: {
      summary: 'Login user',
      tags: ['authentication'],
      response: {
        200: {
          description: 'User logged in successfully',
          type: 'object',
          properties: {
            token: { type: 'string' },
            userId: { type: 'string' },
          },
          required: ['token', 'userId'],
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
          email: request.body.email,
          password: request.body.password,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ token, userId }) => reply.status(200).send({ token, userId }))
        .with({ type: 'invalid_credentials' }, () =>
          reply.status(401).send({ message: 'Invalid email or password', statusCode: 401 }),
        )
        .with({ type: 'user_not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
