import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteTaskCompletionParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteTaskCompletionParams = z.input<typeof deleteTaskCompletionParamsSchema>;
export type DeleteTaskCompletionResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteTaskCompletion(
  params: DeleteTaskCompletionParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteTaskCompletionResult> {
  logger.info('Deleting task completion');

  const validated = deleteTaskCompletionParamsSchema.parse(params);

  const existing = await repositories.taskCompletionsRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  const result = await repositories.taskCompletionsRepository.delete(validated.id);

  if (result.ok) {
    logger.info({ id: validated.id }, 'Task completion deleted');
    return { type: 'success' };
  }

  if (result.error) logger.error('Failed to delete task completion');
  return { type: 'error' };
}
