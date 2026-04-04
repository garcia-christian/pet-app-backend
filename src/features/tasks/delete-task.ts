import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteTaskParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteTaskParams = z.input<typeof deleteTaskParamsSchema>;
export type DeleteTaskResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteTask(
  params: DeleteTaskParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteTaskResult> {
  logger.info('Deleting task');

  const validated = deleteTaskParamsSchema.parse(params);

  const existing = await repositories.tasksRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  const result = await repositories.tasksRepository.delete(validated.id);

  if (result.ok) {
    logger.info({ id: validated.id }, 'Task deleted');
    return { type: 'success' };
  }

  if (result.error) logger.error('Failed to delete task');
  return { type: 'error' };
}
