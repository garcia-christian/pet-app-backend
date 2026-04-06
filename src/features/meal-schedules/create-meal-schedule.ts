import { MealSchedule } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createMealScheduleParamsSchema = z.object({
  petId: z.string().min(1),
  mealName: z.string().min(1),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
  graceMinutes: z.number().int().min(0).default(15),
});

export type CreateMealScheduleParams = z.input<typeof createMealScheduleParamsSchema>;
export type CreateMealScheduleResult =
  | {
      type: 'success';
      mealSchedule: { id: string; petId: string; mealName: string; scheduledTime: string; graceMinutes: number };
    }
  | { type: 'error' };

export async function createMealSchedule(
  params: CreateMealScheduleParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateMealScheduleResult> {
  logger.info('Creating meal schedule');

  const validated = createMealScheduleParamsSchema.parse(params);

  const mealSchedule = new MealSchedule({
    id: crypto.randomUUID(),
    petId: validated.petId,
    mealName: validated.mealName,
    scheduledTime: validated.scheduledTime,
    graceMinutes: validated.graceMinutes,
    createdAt: new Date(),
  });

  const result = await repositories.mealSchedulesRepository.create(mealSchedule);

  if (result.ok && result.data) {
    logger.info({ id: result.data.id }, 'Meal schedule created');
    return {
      type: 'success',
      mealSchedule: {
        id: result.data.id,
        petId: result.data.petId,
        mealName: result.data.mealName,
        scheduledTime: result.data.scheduledTime,
        graceMinutes: result.data.graceMinutes,
      },
    };
  }

  logger.error('Failed to create meal schedule');
  return { type: 'error' };
}
