import { type Task, TaskScheduleType, TaskType } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const updateTaskParamsSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  taskType: z.nativeEnum(TaskType).optional(),
  scheduleType: z.nativeEnum(TaskScheduleType).optional(),
  petId: z.string().nullable().optional(),
});

export type UpdateTaskParams = z.input<typeof updateTaskParamsSchema>;
export type UpdateTaskResult = { type: 'success'; task: Task } | { type: 'not_found' } | { type: 'error' };

export async function updateTask(
  params: UpdateTaskParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<UpdateTaskResult> {
  logger.info('Updating task');

  const validated = updateTaskParamsSchema.parse(params);

  const existing = await repositories.tasksRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  const { id, ...data } = validated;
  const result = await repositories.tasksRepository.update(id, data);

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }
    logger.info({ id }, 'Task updated');
    return { type: 'success', task: result.data };
  }

  if (result.error) logger.error('Failed to update task');
  return { type: 'error' };
}
