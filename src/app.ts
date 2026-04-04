import Cors from '@fastify/cors';
import Helmet from '@fastify/helmet';
import type { Dependencies } from '@infrastructure/di';
import type { FastifyInstance } from 'fastify';
import householdMemberController from './features/household-members/household-member-controller';
import householdController from './features/households/household-controller';
import petController from './features/pets/pet-controller';
import taskCompletionController from './features/task-completions/task-completion-controller';
import taskController from './features/tasks/task-controller';
import urlShortenerController from './features/url-shortener/url-shortener-controller';
import userController from './features/users/user-controller';
import dependencyInjectionPlugin from './plugins/dependency-injection';
import errorHandlerPlugin from './plugins/error-handler';
import healthPlugin from './plugins/health';
import rateLimitPlugin from './plugins/rate-limit';
import swaggerPlugin from './plugins/swagger';

export async function app(fastify: FastifyInstance, dependencies: Dependencies) {
  const { config } = dependencies;
  const isProduction = config.env === 'production';
  const corsOrigin = config.corsOrigin ?? !isProduction;

  fastify.addHook('onClose', async () => {
    await dependencies.dispose();
  });

  await fastify.register(dependencyInjectionPlugin, { dependencies });
  await fastify.register(Helmet, { global: true });
  await fastify.register(Cors, { origin: corsOrigin });

  if (!isProduction) {
    await fastify.register(swaggerPlugin);
  }

  await fastify.register(rateLimitPlugin);
  await fastify.register(errorHandlerPlugin);
  await fastify.register(healthPlugin);
  await fastify.register(householdController);
  await fastify.register(householdMemberController);
  await fastify.register(petController);
  await fastify.register(urlShortenerController);
  await fastify.register(userController);
  await fastify.register(taskCompletionController);
  await fastify.register(taskController);

  return fastify;
}
