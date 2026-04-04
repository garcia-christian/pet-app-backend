import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const listTaskCompletionsParamsSchema = z.object({
  taskId: z.string().min(1),
});

export type ListTaskCompletionsParams = z.input<typeof listTaskCompletionsParamsSchema>;
export type ListTaskCompletionsResult =
  | {
      type: 'success';
      data: { id: string; taskId: string; completedByUserId: string; completedAt: string; date: string }[];
    }
  | { type: 'error' };

export async function listTaskCompletions(
  params: ListTaskCompletionsParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<ListTaskCompletionsResult> {
  logger.info('Listing task completions');

  const validated = listTaskCompletionsParamsSchema.parse(params);

  const result = await repositories.taskCompletionsRepository.findByTaskId(validated.taskId);

  if (result.ok) {
    const completions = result.data ?? [];
    return {
      type: 'success',
      data: completions.map((c) => ({
        id: c.id,
        taskId: c.taskId,
        completedByUserId: c.completedByUserId,
        completedAt: c.completedAt.toISOString(),
        date: c.date.toISOString(),
      })),
    };
  }

  if (result.error) logger.error('Failed to list task completions');
  return { type: 'error' };
}
