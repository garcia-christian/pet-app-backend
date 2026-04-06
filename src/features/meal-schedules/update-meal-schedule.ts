import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const updateMealScheduleParamsSchema = z.object({
  id: z.string().min(1),
  mealName: z.string().min(1).optional(),
  scheduledTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format')
    .optional(),
  graceMinutes: z.number().int().min(0).optional(),
});

export type UpdateMealScheduleParams = z.input<typeof updateMealScheduleParamsSchema>;
export type UpdateMealScheduleResult =
  | {
      type: 'success';
      mealSchedule: { id: string; petId: string; mealName: string; scheduledTime: string; graceMinutes: number };
    }
  | { type: 'not_found' }
  | { type: 'error' };

export async function updateMealSchedule(
  params: UpdateMealScheduleParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<UpdateMealScheduleResult> {
  const validated = updateMealScheduleParamsSchema.parse(params);
  const { id, ...data } = validated;

  const result = await repositories.mealSchedulesRepository.update(id, data);

  if (result.ok) {
    if (!result.data) return { type: 'not_found' };
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

  logger.error('Failed to update meal schedule');
  return { type: 'error' };
}
