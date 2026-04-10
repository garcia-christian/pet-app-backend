import type { FastifyInstance } from 'fastify';
import { match } from 'ts-pattern';
import { createHousehold } from './create-household';
import { deleteHousehold } from './delete-household';
import { getHousehold } from './get-household';
import { joinHousehold } from './join-household';
import { leaveHousehold } from './leave-household';
import { listHouseholds } from './list-households';
import { updateHousehold } from './update-household';

const householdProperties = {
  id: { type: 'string', description: 'Household ID' },
  name: { type: 'string', description: 'Name of the household' },
  inviteCode: { type: 'string', description: 'Invite code for joining' },
  createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
} as const;

export default async function householdController(fastify: FastifyInstance) {
  // POST /api/v1/household/create
  fastify.route<{ Body: { name: string } }>({
    method: 'POST',
    url: '/api/v1/household/create',
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
          properties: householdProperties,
          required: ['id', 'name', 'inviteCode', 'createdAt'],
        },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const result = await createHousehold(
        { name: request.body.name, userId: request.currentUser?.userId },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ household }) => reply.status(201).send(household))
        .with({ type: 'user_already_owns_household' }, () =>
          reply.status(409).send({ message: 'User already owns a household', statusCode: 409 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // POST /api/v1/household/join
  fastify.route<{ Body: { inviteCode: string } }>({
    method: 'POST',
    url: '/api/v1/household/join',
    schema: {
      summary: 'Join a household by invite code',
      tags: ['households'],
      body: {
        type: 'object',
        required: ['inviteCode'],
        properties: {
          inviteCode: { type: 'string', description: 'Invite code' },
        },
      },
      response: {
        200: {
          description: 'Joined household',
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            image: { type: 'string', nullable: true },
            householdId: { type: 'string' },
          },
          required: ['id', 'name', 'householdId'],
        },
        404: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const result = await joinHousehold(
        { inviteCode: request.body.inviteCode, userId: request.currentUser?.userId },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, ({ user }) => reply.status(200).send(user))
        .with({ type: 'household_not_found' }, () =>
          reply.status(404).send({ message: 'Household not found', statusCode: 404 }),
        )
        .with({ type: 'already_member' }, () =>
          reply.status(409).send({ message: 'Already a member of this household', statusCode: 409 }),
        )
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // GET /api/v1/households (list all — keep for backward compat)
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
                required: ['id', 'name', 'inviteCode', 'createdAt'],
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

  // GET /api/v1/household/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'GET',
    url: '/api/v1/household/:id',
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
          required: ['id', 'name', 'inviteCode', 'createdAt'],
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

  // GET /api/v1/household/:householdId/members
  fastify.route<{ Params: { householdId: string } }>({
    method: 'GET',
    url: '/api/v1/household/:householdId/members',
    schema: {
      summary: 'List household members',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['householdId'],
        properties: {
          householdId: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'List of members',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              image: { type: 'string', nullable: true },
              householdId: { type: 'string', nullable: true },
            },
          },
        },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const membersResult = await fastify.dependencies.repositories.householdMembersRepository.findByHouseholdId(
        request.params.householdId,
      );

      if (!membersResult.ok) {
        return reply.status(500).send({ message: 'Internal server error', statusCode: 500 });
      }

      const members = membersResult.data ?? [];
      const users = await Promise.all(
        members.map(async (m) => {
          const userResult = await fastify.dependencies.repositories.usersRepository.findById(m.userId);
          if (userResult?.ok && userResult.data) {
            return {
              id: userResult.data.id,
              name: userResult.data.name,
              image: userResult.data.image,
              householdId: m.householdId,
            };
          }
          return null;
        }),
      );

      return reply.status(200).send(users.filter(Boolean));
    },
  });

  // GET /api/v1/household/:householdId/pets
  fastify.route<{ Params: { householdId: string } }>({
    method: 'GET',
    url: '/api/v1/household/:householdId/pets',
    schema: {
      summary: 'List pets by household',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['householdId'],
        properties: {
          householdId: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'List of pets',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              householdId: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const result = await fastify.dependencies.repositories.petsRepository.findByHouseholdId(
        request.params.householdId,
      );

      if (!result.ok) {
        return reply.status(500).send({ message: 'Internal server error', statusCode: 500 });
      }

      const pets = (result.data ?? []).map((p) => ({
        id: p.id,
        householdId: p.householdId,
        name: p.name,
        type: p.type,
      }));

      return reply.status(200).send(pets);
    },
  });

  // POST /api/v1/household/:householdId/leave
  fastify.route<{ Params: { householdId: string } }>({
    method: 'POST',
    url: '/api/v1/household/:householdId/leave',
    schema: {
      summary: 'Leave a household',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['householdId'],
        properties: {
          householdId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'boolean',
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const result = await leaveHousehold(
        { householdId: request.params.householdId, userId: request.currentUser?.userId },
        fastify.dependencies,
      );
      return match(result)
        .with({ type: 'success' }, () => reply.status(200).send({ data: true }))
        .with({ type: 'not_found' }, () => reply.status(404).send({ message: 'Membership not found', statusCode: 404 }))
        .with({ type: 'error' }, () => reply.status(500).send({ message: 'Internal server error', statusCode: 500 }))
        .exhaustive();
    },
  });

  // PUT /api/v1/household/:id (keep for updates)
  fastify.route<{ Params: { id: string }; Body: { name: string } }>({
    method: 'PUT',
    url: '/api/v1/household/:id',
    schema: {
      summary: 'Update a household',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
        },
      },
      response: {
        200: {
          description: 'Household updated',
          type: 'object',
          properties: householdProperties,
          required: ['id', 'name', 'inviteCode', 'createdAt'],
        },
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

  // DELETE /api/v1/household/:id
  fastify.route<{ Params: { id: string } }>({
    method: 'DELETE',
    url: '/api/v1/household/:id',
    schema: {
      summary: 'Delete a household',
      tags: ['households'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      response: {
        204: { description: 'Household deleted', type: 'null' },
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
