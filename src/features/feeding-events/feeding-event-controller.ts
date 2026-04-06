import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createFeedingEvent } from './create-feeding-event';
import { deleteFeedingEvent } from './delete-feeding-event';
import { listFeedingEvents } from './list-feeding-events';

const feedingEventProperties = {
  id: { type: 'string' },
  petId: { type: 'string' },
  mealScheduleId: { type: 'string' },
  userId: { type: 'string' },
  fedAt: { type: 'string', format: 'date-time' },
  remarks: { type: 'string', nullable: true },
  createdAt: { type: 'string', format: 'date-time' },
} as const;

export default async function feedingEventController(fastify: FastifyInstance) {
  // POST /api/v1/feeding-events
  fastify.route<{
    Body: { petId: string; mealScheduleId: string; userId: string; fedAt?: string; remarks?: string | null };
  }>({
    method: 'POST',
    url: '/api/v1/feeding-events',
    schema: {
      summary: 'Record a feeding event',
      tags: ['feeding-events'],
      body: {
        type: 'object',
        required: ['petId', 'mealScheduleId', 'userId'],
        properties: {
          petId: { type: 'string' },
          mealScheduleId: { type: 'string' },
          userId: { type: 'string' },
          fedAt: { type: 'string', format: 'date-time' },
          remarks: { type: 'string', nullable: true },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: feedingEventProperties,
          required: ['id', 'petId', 'mealScheduleId', 'userId', 'fedAt', 'createdAt'],
        },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await createFeedingEvent(
        {
          petId: request.body.petId,
          mealScheduleId: request.body.mealScheduleId,
          userId: request.body.userId,
          fedAt: request.body.fedAt,
          remarks: request.body.remarks ?? null,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ feedingEvent }) => reply.status(201).send(feedingEvent))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/feeding-events?petId=xxx or ?mealScheduleId=xxx
  fastify.route<{ Querystring: { petId?: string; mealScheduleId?: string } }>({
    method: 'GET',
    url: '/api/v1/feeding-events',
    schema: {
      summary: 'List feeding events',
      tags: ['feeding-events'],
      querystring: {
        type: 'object',
        properties: {
          petId: { type: 'string' },
          mealScheduleId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: feedingEventProperties,
            required: ['id', 'petId', 'mealScheduleId', 'userId', 'fedAt', 'createdAt'],
          },
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      if (!request.query.petId && !request.query.mealScheduleId) {
        return reply.status(400).send({ message: 'petId or mealScheduleId is required', statusCode: 400 });
      }

      const result = await listFeedingEvents(
        { petId: request.query.petId, mealScheduleId: request.query.mealScheduleId },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ feedingEvents }) => reply.status(200).send(feedingEvents))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // DELETE /api/v1/feeding-events/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/feeding-events/:id',
    schema: {
      summary: 'Delete a feeding event',
      tags: ['feeding-events'],
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
      const result = await deleteFeedingEvent({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Feeding event not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
