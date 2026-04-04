import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createTaskCompletion } from './create-task-completion';
import { deleteTaskCompletion } from './delete-task-completion';
import { getTaskCompletion } from './get-task-completion';
import { listTaskCompletions } from './list-task-completions';

const taskCompletionResponseProperties = {
  id: { type: 'string' },
  taskId: { type: 'string' },
  completedByUserId: { type: 'string' },
  completedAt: { type: 'string', format: 'date-time' },
  date: { type: 'string', format: 'date-time' },
} as const;

export default async function taskCompletionController(fastify: FastifyInstance) {
  fastify.route<{ Body: { taskId: string; completedByUserId: string; date: string } }>({
    method: 'POST',
    url: '/api/v1/task-completions',
    schema: {
      summary: 'Create a new task completion',
      tags: ['task-completions'],
      body: {
        type: 'object',
        required: ['taskId', 'completedByUserId', 'date'],
        properties: {
          taskId: { type: 'string', description: 'ID of the task', example: '550e8400-e29b-41d4-a716-446655440000' },
          completedByUserId: {
            type: 'string',
            description: 'ID of the user who completed the task',
            example: '550e8400-e29b-41d4-a716-446655440001',
          },
          date: { type: 'string', format: 'date', description: 'Date of the completion', example: '2026-04-02' },
        },
      },
      response: {
        201: {
          description: 'Task completion created',
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await createTaskCompletion(
        {
          taskId: request.body.taskId,
          completedByUserId: request.body.completedByUserId,
          date: request.body.date,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(201).send({ id }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/task-completions/:id',
    schema: {
      summary: 'Get a task completion by ID',
      tags: ['task-completions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Task completion ID' },
        },
      },
      response: {
        200: {
          description: 'Task completion found',
          type: 'object',
          properties: taskCompletionResponseProperties,
          required: ['id', 'taskId', 'completedByUserId', 'completedAt', 'date'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getTaskCompletion({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ data }) => reply.status(200).send(data))
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Task completion not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Querystring: { taskId: string } }>({
    method: 'GET',
    url: '/api/v1/task-completions',
    schema: {
      summary: 'List task completions by task ID',
      tags: ['task-completions'],
      querystring: {
        type: 'object',
        required: ['taskId'],
        properties: {
          taskId: { type: 'string', description: 'Task ID to filter completions' },
        },
      },
      response: {
        200: {
          description: 'List of task completions',
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: taskCompletionResponseProperties,
                required: ['id', 'taskId', 'completedByUserId', 'completedAt', 'date'],
              },
            },
          },
          required: ['data'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await listTaskCompletions({ taskId: request.query.taskId }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ data }) => reply.status(200).send({ data }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/task-completions/:id',
    schema: {
      summary: 'Delete a task completion',
      tags: ['task-completions'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Task completion ID' },
        },
      },
      response: {
        204: {
          description: 'Task completion deleted',
          type: 'null',
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deleteTaskCompletion({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Task completion not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
