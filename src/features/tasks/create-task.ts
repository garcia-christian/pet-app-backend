import { Task, TaskScheduleType, TaskType } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createTaskParamsSchema = z.object({
  householdId: z.string().min(1),
  petId: z.string().nullable().default(null),
  title: z.string().min(1),
  taskType: z.nativeEnum(TaskType),
  scheduleType: z.nativeEnum(TaskScheduleType).default(TaskScheduleType.DAILY),
});

export type CreateTaskParams = z.input<typeof createTaskParamsSchema>;
export type CreateTaskResult = { type: 'success'; id: string } | { type: 'error' };

export async function createTask(
  params: CreateTaskParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateTaskResult> {
  logger.info('Creating task');

  const validated = createTaskParamsSchema.parse(params);

  const task = new Task({
    id: crypto.randomUUID(),
    householdId: validated.householdId,
    petId: validated.petId,
    title: validated.title,
    taskType: validated.taskType,
    scheduleType: validated.scheduleType,
    createdAt: new Date(),
  });

  const result = await repositories.tasksRepository.create(task);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'Task created');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to create task');
  return { type: 'error' };
}
