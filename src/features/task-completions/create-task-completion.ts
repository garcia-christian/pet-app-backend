import { TaskCompletion } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createTaskCompletionParamsSchema = z.object({
  taskId: z.string().min(1),
  completedByUserId: z.string().min(1),
  date: z
    .string()
    .date()
    .transform((val) => new Date(val)),
});

export type CreateTaskCompletionParams = z.input<typeof createTaskCompletionParamsSchema>;
export type CreateTaskCompletionResult = { type: 'success'; id: string } | { type: 'error' };

export async function createTaskCompletion(
  params: CreateTaskCompletionParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateTaskCompletionResult> {
  logger.info('Creating task completion');

  const validated = createTaskCompletionParamsSchema.parse(params);

  const taskCompletion = new TaskCompletion({
    id: crypto.randomUUID(),
    taskId: validated.taskId,
    completedByUserId: validated.completedByUserId,
    completedAt: new Date(),
    date: validated.date,
  });

  const result = await repositories.taskCompletionsRepository.create(taskCompletion);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'Task completion created');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to create task completion');
  return { type: 'error' };
}
