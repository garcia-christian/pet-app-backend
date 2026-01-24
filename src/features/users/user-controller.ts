import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createUser } from './create-user';

export default async function userController(fastify: FastifyInstance) {
  fastify.route<{ Body: { googleId: string; name: string; email: string; avatarUrl?: string | null } }>({
    method: 'POST',
    url: '/api/v1/users',
    schema: {
      summary: 'Create a new user',
      tags: ['users'],
      body: {
        type: 'object',
        required: ['googleId', 'name', 'email'],
        properties: {
          googleId: { type: 'string', description: 'Google ID of the user', example: '1234567890' },
          name: { type: 'string', description: 'Name of the user', example: 'John Doe' },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address of the user',
            example: 'john.doe@example.com',
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            description: 'Avatar URL of the user',
            example: 'https://example.com/avatar.jpg',
          },
        },
      },
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
      const result = await createUser(
        {
          googleId: request.body.googleId,
          name: request.body.name,
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
}
