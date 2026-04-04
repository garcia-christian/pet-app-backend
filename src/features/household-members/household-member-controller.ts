import type { HouseholdRole } from '@domain/entities';
import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createHouseholdMember } from './create-household-member';
import { deleteHouseholdMember } from './delete-household-member';
import { getHouseholdMember } from './get-household-member';
import { listHouseholdMembers } from './list-household-members';
import { updateHouseholdMember } from './update-household-member';

const householdMemberResponseProperties = {
  id: { type: 'string' },
  householdId: { type: 'string' },
  userId: { type: 'string' },
  role: { type: 'string', enum: ['OWNER', 'MEMBER'] },
  joinedAt: { type: 'string', format: 'date-time' },
} as const;

export default async function householdMemberController(fastify: FastifyInstance) {
  fastify.route<{ Body: { householdId: string; userId: string; role?: string } }>({
    method: 'POST',
    url: '/api/v1/household-members',
    schema: {
      summary: 'Create a new household member',
      tags: ['household-members'],
      body: {
        type: 'object',
        required: ['householdId', 'userId'],
        properties: {
          householdId: { type: 'string', description: 'ID of the household' },
          userId: { type: 'string', description: 'ID of the user' },
          role: { type: 'string', enum: ['OWNER', 'MEMBER'], description: 'Role of the member', default: 'MEMBER' },
        },
      },
      response: {
        201: {
          description: 'Household member created',
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
      const result = await createHouseholdMember(
        {
          householdId: request.body.householdId,
          userId: request.body.userId,
          role: request.body.role as HouseholdRole | undefined,
        },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(201).send({ id }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Querystring: { householdId: string } }>({
    method: 'GET',
    url: '/api/v1/household-members',
    schema: {
      summary: 'List household members by household',
      tags: ['household-members'],
      querystring: {
        type: 'object',
        required: ['householdId'],
        properties: {
          householdId: { type: 'string', description: 'ID of the household' },
        },
      },
      response: {
        200: {
          description: 'List of household members',
          type: 'object',
          properties: {
            householdMembers: {
              type: 'array',
              items: {
                type: 'object',
                properties: householdMemberResponseProperties,
                required: ['id', 'householdId', 'userId', 'role', 'joinedAt'],
              },
            },
          },
          required: ['householdMembers'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await listHouseholdMembers({ householdId: request.query.householdId }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ householdMembers }) => reply.status(200).send({ householdMembers }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/household-members/:id',
    schema: {
      summary: 'Get a household member by ID',
      tags: ['household-members'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID of the household member' },
        },
      },
      response: {
        200: {
          description: 'Household member found',
          type: 'object',
          properties: householdMemberResponseProperties,
          required: ['id', 'householdId', 'userId', 'role', 'joinedAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await getHouseholdMember({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, ({ householdMember }) => reply.status(200).send(householdMember))
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Household member not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string }; Body: { role: string } }>({
    method: 'PUT',
    url: '/api/v1/household-members/:id',
    schema: {
      summary: 'Update a household member role',
      tags: ['household-members'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID of the household member' },
        },
      },
      body: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['OWNER', 'MEMBER'], description: 'New role for the member' },
        },
      },
      response: {
        200: {
          description: 'Household member updated',
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await updateHouseholdMember(
        { id: request.params.id, role: request.body.role as HouseholdRole },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ id }) => reply.status(200).send({ id }))
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Household member not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/household-members/:id',
    schema: {
      summary: 'Delete a household member',
      tags: ['household-members'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', description: 'ID of the household member' },
        },
      },
      response: {
        204: {
          description: 'Household member deleted',
          type: 'null',
        },
        400: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await deleteHouseholdMember({ id: request.params.id }, fastify.dependencies);
      return match(result)
        .with({ type: 'success' }, () => reply.status(204).send())
        .with({ type: 'not_found' }, () =>
          reply.status(404).send({ message: 'Household member not found', statusCode: 404 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });
}
