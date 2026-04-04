import type { PetType } from '@domain/entities';
import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createPet } from './create-pet';
import { deletePet } from './delete-pet';
import { getPet } from './get-pet';
import { listPets } from './list-pets';
import { updatePet } from './update-pet';

const petTypeEnum = ['DOG', 'CAT', 'OTHER'];

const petResponseProperties = {
  id: { type: 'string' },
  householdId: { type: 'string' },
  name: { type: 'string' },
  type: { type: 'string', enum: petTypeEnum },
  createdAt: { type: 'string', format: 'date-time' },
} as const;

export default async function petController(fastify: FastifyInstance) {
  // POST /api/v1/pets
  fastify.route<{ Body: { householdId: string; name: string; type: string } }>({
    method: 'POST',
    url: '/api/v1/pets',
    schema: {
      summary: 'Create a new pet',
      tags: ['pets'],
      body: {
        type: 'object',
        required: ['householdId', 'name', 'type'],
        properties: {
          householdId: { type: 'string', description: 'Household ID the pet belongs to' },
          name: { type: 'string', description: 'Name of the pet', example: 'Buddy' },
          type: { type: 'string', enum: petTypeEnum, description: 'Type of pet', example: 'DOG' },
        },
      },
      response: {
        201: {
          description: 'Pet created',
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
      const result = await createPet(
        {
          householdId: request.body.householdId,
          name: request.body.name,
          type: request.body.type as PetType,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(201).send({ id }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/pets?householdId=xxx
  fastify.route<{ Querystring: { householdId: string } }>({
    method: 'GET',
    url: '/api/v1/pets',
    schema: {
      summary: 'List pets by household',
      tags: ['pets'],
      querystring: {
        type: 'object',
        required: ['householdId'],
        properties: {
          householdId: { type: 'string', description: 'Household ID to filter pets by' },
        },
      },
      response: {
        200: {
          description: 'List of pets',
          type: 'object',
          properties: {
            pets: {
              type: 'array',
              items: {
                type: 'object',
                properties: petResponseProperties,
                required: ['id', 'householdId', 'name', 'type', 'createdAt'],
              },
            },
          },
          required: ['pets'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await listPets({ householdId: request.query.householdId }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ pets }) => reply.status(200).send({ pets }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/pets/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/pets/:id',
    schema: {
      summary: 'Get a pet by ID',
      tags: ['pets'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Pet ID' },
        },
      },
      response: {
        200: {
          description: 'Pet found',
          type: 'object',
          properties: petResponseProperties,
          required: ['id', 'householdId', 'name', 'type', 'createdAt'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getPet({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ pet }) => reply.status(200).send(pet))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Pet not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // PUT /api/v1/pets/:id
  fastify.route<{ Params: { id: string }; Body: { name?: string; type?: string } }>({
    method: 'PUT',
    url: '/api/v1/pets/:id',
    schema: {
      summary: 'Update a pet',
      tags: ['pets'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Pet ID' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name of the pet', example: 'Buddy' },
          type: { type: 'string', enum: petTypeEnum, description: 'Type of pet', example: 'DOG' },
        },
      },
      response: {
        200: {
          description: 'Pet updated',
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await updatePet(
        {
          id: request.params.id,
          name: request.body.name,
          type: request.body.type as PetType | undefined,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, () => reply.status(200).send({ message: 'Pet updated' }))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Pet not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // DELETE /api/v1/pets/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/pets/:id',
    schema: {
      summary: 'Delete a pet',
      tags: ['pets'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'Pet ID' },
        },
      },
      response: {
        200: {
          description: 'Pet deleted',
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deletePet({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(200).send({ message: 'Pet deleted' }))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Pet not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
