import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createTask } from './create-task';
import { deleteTask } from './delete-task';
import { getTask } from './get-task';
import { listTasks } from './list-tasks';
import { updateTask } from './update-task';

const taskTypeEnum = ['FEED', 'WALK', 'CLEAN', 'OTHER'];
const scheduleTypeEnum = ['DAILY', 'ONCE'];

const taskResponseProperties = {
  id: { type: 'string' },
  householdId: { type: 'string' },
  petId: { type: ['string', 'null'] },
  title: { type: 'string' },
  taskType: { type: 'string', enum: taskTypeEnum },
  scheduleType: { type: 'string', enum: scheduleTypeEnum },
  createdAt: { type: 'string', format: 'date-time' },
};

export default async function taskController(fastify: FastifyInstance) {
  // POST /api/v1/tasks - create
  fastify.route<{
    Body: {
      householdId: string;
      petId?: string | null;
      title: string;
      taskType: string;
      scheduleType?: string;
    };
  }>({
    method: 'POST',
    url: '/api/v1/tasks',
    schema: {
      summary: 'Create a new task',
      tags: ['tasks'],
      body: {
        type: 'object',
        required: ['householdId', 'title', 'taskType'],
        properties: {
          householdId: { type: 'string', description: 'Household ID', example: '123e4567-e89b-12d3-a456-426614174000' },
          petId: { type: ['string', 'null'], description: 'Pet ID (optional)', example: null },
          title: { type: 'string', description: 'Task title', example: 'Feed the dog' },
          taskType: { type: 'string', enum: taskTypeEnum, description: 'Type of task', example: 'FEED' },
          scheduleType: { type: 'string', enum: scheduleTypeEnum, description: 'Schedule type', example: 'DAILY' },
        },
      },
      response: {
        201: {
          description: 'Task created',
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
      const result = await createTask(
        {
          householdId: request.body.householdId,
          petId: request.body.petId ?? null,
          title: request.body.title,
          taskType: request.body.taskType as Parameters<typeof createTask>[0]['taskType'],
          scheduleType: request.body.scheduleType as Parameters<typeof createTask>[0]['scheduleType'],
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(201).send({ id }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/tasks?householdId=xxx - list by household
  fastify.route<{
    Querystring: { householdId: string };
  }>({
    method: 'GET',
    url: '/api/v1/tasks',
    schema: {
      summary: 'List tasks by household',
      tags: ['tasks'],
      querystring: {
        type: 'object',
        required: ['householdId'],
        properties: {
          householdId: { type: 'string', description: 'Household ID' },
        },
      },
      response: {
        200: {
          description: 'List of tasks',
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: taskResponseProperties,
                required: ['id', 'householdId', 'petId', 'title', 'taskType', 'scheduleType', 'createdAt'],
              },
            },
          },
          required: ['tasks'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await listTasks({ householdId: request.query.householdId }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ tasks }) => reply.status(200).send({ tasks }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/tasks/:id - get
  fastify.route<{
    Params: { id: string };
  }>({
    method: 'GET',
    url: '/api/v1/tasks/:id',
    schema: {
      summary: 'Get a task by ID',
      tags: ['tasks'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Task ID' },
        },
      },
      response: {
        200: {
          description: 'Task found',
          type: 'object',
          properties: taskResponseProperties,
          required: ['id', 'householdId', 'petId', 'title', 'taskType', 'scheduleType', 'createdAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getTask({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ task }) => reply.status(200).send(task))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Task not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // PUT /api/v1/tasks/:id - update
  fastify.route<{
    Params: { id: string };
    Body: {
      title?: string;
      taskType?: string;
      scheduleType?: string;
      petId?: string | null;
    };
  }>({
    method: 'PUT',
    url: '/api/v1/tasks/:id',
    schema: {
      summary: 'Update a task',
      tags: ['tasks'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Task ID' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Task title', example: 'Walk the dog' },
          taskType: { type: 'string', enum: taskTypeEnum, description: 'Type of task', example: 'WALK' },
          scheduleType: { type: 'string', enum: scheduleTypeEnum, description: 'Schedule type', example: 'ONCE' },
          petId: { type: ['string', 'null'], description: 'Pet ID', example: null },
        },
      },
      response: {
        200: {
          description: 'Task updated',
          type: 'object',
          properties: taskResponseProperties,
          required: ['id', 'householdId', 'petId', 'title', 'taskType', 'scheduleType', 'createdAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await updateTask(
        {
          id: request.params.id,
          ...request.body,
          taskType: request.body.taskType as Parameters<typeof updateTask>[0]['taskType'],
          scheduleType: request.body.scheduleType as Parameters<typeof updateTask>[0]['scheduleType'],
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ task }) => reply.status(200).send(task))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Task not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // DELETE /api/v1/tasks/:id - delete
  fastify.route<{
    Params: { id: string };
  }>({
    method: 'DELETE',
    url: '/api/v1/tasks/:id',
    schema: {
      summary: 'Delete a task',
      tags: ['tasks'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Task ID' },
        },
      },
      response: {
        204: {
          description: 'Task deleted',
          type: 'null',
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deleteTask({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Task not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
