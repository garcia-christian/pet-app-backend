import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getTaskCompletionParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetTaskCompletionParams = z.input<typeof getTaskCompletionParamsSchema>;
export type GetTaskCompletionResult =
  | {
      type: 'success';
      data: { id: string; taskId: string; completedByUserId: string; completedAt: string; date: string };
    }
  | { type: 'not_found' }
  | { type: 'error' };

export async function getTaskCompletion(
  params: GetTaskCompletionParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetTaskCompletionResult> {
  logger.info('Getting task completion');

  const validated = getTaskCompletionParamsSchema.parse(params);

  const result = await repositories.taskCompletionsRepository.findById(validated.id);

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }
    return {
      type: 'success',
      data: {
        id: result.data.id,
        taskId: result.data.taskId,
        completedByUserId: result.data.completedByUserId,
        completedAt: result.data.completedAt.toISOString(),
        date: result.data.date.toISOString(),
      },
    };
  }

  if (result.error) logger.error('Failed to get task completion');
  return { type: 'error' };
}
