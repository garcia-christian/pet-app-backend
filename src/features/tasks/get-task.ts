import type { Task } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getTaskParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetTaskParams = z.input<typeof getTaskParamsSchema>;
export type GetTaskResult = { type: 'success'; task: Task } | { type: 'not_found' } | { type: 'error' };

export async function getTask(
  params: GetTaskParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetTaskResult> {
  logger.info('Getting task');

  const validated = getTaskParamsSchema.parse(params);

  const result = await repositories.tasksRepository.findById(validated.id);

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }
    return { type: 'success', task: result.data };
  }

  if (result.error) logger.error('Failed to get task');
  return { type: 'error' };
}
