import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createHousehold } from './create-household';
import { deleteHousehold } from './delete-household';
import { getHousehold } from './get-household';
import { listHouseholds } from './list-households';
import { updateHousehold } from './update-household';

const householdProperties = {
  id: { type: 'string', description: 'Household ID' },
  name: { type: 'string', description: 'Name of the household' },
  createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
} as const;

export default async function householdController(fastify: FastifyInstance) {
  // POST /api/v1/households
  fastify.route<{ Body: { name: string } }>({
    method: 'POST',
    url: '/api/v1/households',
    schema: {
      summary: 'Create a new household',
      tags: ['households'],
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Name of the household', example: 'Smith Family' },
        },
      },
      response: {
        201: {
          description: 'Household created',
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
      const result = await createHousehold({ name: request.body.name }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(201).send({ id }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/households
  fastify.route({
    method: 'GET',
    url: '/api/v1/households',
    schema: {
      summary: 'List all households',
      tags: ['households'],
      response: {
        200: {
          description: 'List of households',
          type: 'object',
          properties: {
            households: {
              type: 'array',
              items: {
                type: 'object',
                properties: householdProperties,
                required: ['id', 'name', 'createdAt'],
              },
            },
          },
          required: ['households'],
        },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (_request, reply) => {
      const result = await listHouseholds(fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ households }) => reply.status(200).send({ households }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/households/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/households/:id',
    schema: {
      summary: 'Get a household by ID',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Household ID' },
        },
      },
      response: {
        200: {
          description: 'Household found',
          type: 'object',
          properties: householdProperties,
          required: ['id', 'name', 'createdAt'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getHousehold({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ household }) => reply.status(200).send(household))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Household not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // PUT /api/v1/households/:id
  fastify.route<{ Params: { id: string }; Body: { name: string } }>({
    method: 'PUT',
    url: '/api/v1/households/:id',
    schema: {
      summary: 'Update a household',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Household ID' },
        },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', description: 'Name of the household', example: 'Updated Family Name' },
        },
      },
      response: {
        200: {
          description: 'Household updated',
          type: 'object',
          properties: householdProperties,
          required: ['id', 'name', 'createdAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await updateHousehold({ id: request.params.id, name: request.body.name }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ household }) => reply.status(200).send(household))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Household not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // DELETE /api/v1/households/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/households/:id',
    schema: {
      summary: 'Delete a household',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Household ID' },
        },
      },
      response: {
        204: {
          description: 'Household deleted',
          type: 'null',
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deleteHousehold({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Household not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
