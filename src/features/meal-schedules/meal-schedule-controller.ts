import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createMealSchedule } from './create-meal-schedule';
import { deleteMealSchedule } from './delete-meal-schedule';
import { getMealSchedule } from './get-meal-schedule';
import { listMealSchedules } from './list-meal-schedules';
import { updateMealSchedule } from './update-meal-schedule';

const mealScheduleProperties = {
  id: { type: 'string' },
  petId: { type: 'string' },
  mealName: { type: 'string' },
  scheduledTime: { type: 'string', description: 'HH:mm format' },
  graceMinutes: { type: 'integer' },
} as const;

export default async function mealScheduleController(fastify: FastifyInstance) {
  // POST /api/v1/mealschedule/create
  fastify.route<{ Body: { petId: string; mealName: string; scheduledTime: string; graceMinutes?: number } }>({
    method: 'POST',
    url: '/api/v1/mealschedule/create',
    schema: {
      summary: 'Create a meal schedule',
      tags: ['meal-schedules'],
      body: {
        type: 'object',
        required: ['petId', 'mealName', 'scheduledTime'],
        properties: {
          petId: { type: 'string' },
          mealName: { type: 'string', example: 'Breakfast' },
          scheduledTime: { type: 'string', example: '08:00' },
          graceMinutes: { type: 'integer', default: 15 },
        },
      },
      response: {
        201: {
          description: 'Meal schedule created',
          type: 'object',
          properties: mealScheduleProperties,
          required: ['id', 'petId', 'mealName', 'scheduledTime', 'graceMinutes'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await createMealSchedule(
        {
          petId: request.body.petId,
          mealName: request.body.mealName,
          scheduledTime: request.body.scheduledTime,
          graceMinutes: request.body.graceMinutes ?? 15,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ mealSchedule }) => reply.status(201).send(mealSchedule))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/mealschedule/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/mealschedule/:id',
    schema: {
      summary: 'Get a meal schedule by ID',
      tags: ['meal-schedules'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      response: {
        200: {
          type: 'object',
          properties: mealScheduleProperties,
          required: ['id', 'petId', 'mealName', 'scheduledTime', 'graceMinutes'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getMealSchedule({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ mealSchedule }) => reply.status(200).send(mealSchedule))
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Meal schedule not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/pet/:petId/mealschedules
  fastify.route<{ Params: { petId: string } }>({
    method: 'GET',
    url: '/api/v1/pet/:petId/mealschedules',
    schema: {
      summary: 'List meal schedules for a pet',
      tags: ['meal-schedules'],
      params: {
        type: 'object',
        required: ['petId'],
        properties: { petId: { type: 'string' } },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: mealScheduleProperties,
            required: ['id', 'petId', 'mealName', 'scheduledTime', 'graceMinutes'],
          },
        },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await listMealSchedules({ petId: request.params.petId }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ mealSchedules }) => reply.status(200).send(mealSchedules))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // PUT /api/v1/mealschedule/:id
  fastify.route<{
    Params: { id: string };
    Body: { mealName?: string; scheduledTime?: string; graceMinutes?: number };
  }>({
    method: 'PUT',
    url: '/api/v1/mealschedule/:id',
    schema: {
      summary: 'Update a meal schedule',
      tags: ['meal-schedules'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          mealName: { type: 'string' },
          scheduledTime: { type: 'string' },
          graceMinutes: { type: 'integer' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: mealScheduleProperties,
          required: ['id', 'petId', 'mealName', 'scheduledTime', 'graceMinutes'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await updateMealSchedule(
        {
          id: request.params.id,
          mealName: request.body.mealName,
          scheduledTime: request.body.scheduledTime,
          graceMinutes: request.body.graceMinutes,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ mealSchedule }) => reply.status(200).send(mealSchedule))
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Meal schedule not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // DELETE /api/v1/mealschedule/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/mealschedule/:id',
    schema: {
      summary: 'Delete a meal schedule',
      tags: ['meal-schedules'],
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      response: {
        204: { description: 'Deleted', type: 'null' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deleteMealSchedule({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Meal schedule not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
