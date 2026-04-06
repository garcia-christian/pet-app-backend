import type { TokenPayload } from '@domain/services';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: TokenPayload;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Missing or invalid Authorization header', statusCode: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await fastify.dependencies.jwtService.verifyAccess(token);

    if (!payload) {
      return reply.status(401).send({ message: 'Invalid or expired token', statusCode: 401 });
    }

    request.currentUser = payload;
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, {
  name: 'auth-plugin',
  dependencies: ['dependency-injection-plugin'],
});
