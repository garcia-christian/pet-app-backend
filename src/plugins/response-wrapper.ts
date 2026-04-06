import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

async function responseWrapperPlugin(fastify: FastifyInstance) {
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
    // Skip non-JSON responses (redirects, 204 no content, health checks, swagger)
    if (
      reply.statusCode === 204 ||
      reply.statusCode === 302 ||
      request.url === '/health' ||
      request.url === '/ready' ||
      request.url.startsWith('/api-docs')
    ) {
      return payload;
    }

    const contentType = reply.getHeader('content-type') as string | undefined;
    if (!contentType || !contentType.includes('application/json')) {
      return payload;
    }

    // Parse the existing payload
    let parsed: unknown;
    try {
      parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch {
      return payload;
    }

    // Already wrapped (check for our envelope shape)
    if (parsed && typeof parsed === 'object' && 'success' in parsed) {
      return payload;
    }

    const statusCode = reply.statusCode;

    // Error responses (4xx, 5xx) — wrap in error envelope
    if (statusCode >= 400) {
      const errorBody = parsed as Record<string, unknown>;
      const wrapped = {
        meta: {
          message: (errorBody.message as string) ?? 'An error occurred',
          statusCode,
          ...(errorBody.errors ? { errors: errorBody.errors } : {}),
        },
      };
      return JSON.stringify(wrapped);
    }

    // Success responses — wrap in success envelope
    const message = getSuccessMessage(request.method, statusCode);
    const wrapped = {
      success: true,
      message,
      statusCode,
      data: parsed,
    };
    return JSON.stringify(wrapped);
  });
}

function getSuccessMessage(method: string, statusCode: number): string {
  if (statusCode === 201) return 'Created successfully';
  switch (method) {
    case 'GET':
      return 'Retrieved successfully';
    case 'PUT':
    case 'PATCH':
      return 'Updated successfully';
    case 'DELETE':
      return 'Deleted successfully';
    default:
      return 'Success';
  }
}

export default fp(responseWrapperPlugin, { name: 'response-wrapper-plugin' });
