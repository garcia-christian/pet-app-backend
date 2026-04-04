import type { Task } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const listTasksParamsSchema = z.object({
  householdId: z.string().min(1),
});

export type ListTasksParams = z.input<typeof listTasksParamsSchema>;
export type ListTasksResult = { type: 'success'; tasks: Task[] } | { type: 'error' };

export async function listTasks(
  params: ListTasksParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<ListTasksResult> {
  logger.info('Listing tasks');

  const validated = listTasksParamsSchema.parse(params);

  const result = await repositories.tasksRepository.findByHouseholdId(validated.householdId);

  if (result.ok) {
    return { type: 'success', tasks: result.data ?? [] };
  }

  if (result.error) logger.error('Failed to list tasks');
  return { type: 'error' };
}
