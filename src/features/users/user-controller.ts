import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createUser } from './create-user';
import { deleteUser } from './delete-user';
import { getUser } from './get-user';
import { listUsers } from './list-users';
import { updateUser } from './update-user';

const userResponseProperties = {
  id: { type: 'string' },
  googleId: { type: 'string' },
  name: { type: 'string' },
  email: { type: 'string' },
  avatarUrl: { type: 'string', nullable: true },
} as const;

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
          description: 'User created',
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

  fastify.route({
    method: 'GET',
    url: '/api/v1/users',
    schema: {
      summary: 'List all users',
      tags: ['users'],
      response: {
        200: {
          description: 'List of users',
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: userResponseProperties,
              },
            },
          },
          required: ['users'],
        },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (_request, reply) => {
      const result = await listUsers(fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ users }) => reply.status(200).send({ users }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/users/:id',
    schema: {
      summary: 'Get a user by ID',
      tags: ['users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
      },
      response: {
        200: {
          description: 'User found',
          type: 'object',
          properties: userResponseProperties,
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getUser({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ user }) => reply.status(200).send(user))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{
    Params: { id: string };
    Body: { name?: string; email?: string; avatarUrl?: string | null };
  }>({
    method: 'PUT',
    url: '/api/v1/users/:id',
    schema: {
      summary: 'Update a user',
      tags: ['users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
      },
      body: {
        type: 'object',
        properties: {
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
            nullable: true,
            description: 'Avatar URL of the user',
            example: 'https://example.com/avatar.jpg',
          },
        },
      },
      response: {
        200: {
          description: 'User updated',
          type: 'object',
          properties: userResponseProperties,
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await updateUser(
        {
          id: request.params.id,
          ...request.body,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ user }) => reply.status(200).send(user))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/users/:id',
    schema: {
      summary: 'Delete a user',
      tags: ['users'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'User ID' },
        },
      },
      response: {
        204: {
          description: 'User deleted',
          type: 'null',
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deleteUser({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'User not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
