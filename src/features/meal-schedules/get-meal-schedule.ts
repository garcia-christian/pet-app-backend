import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getMealScheduleParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetMealScheduleParams = z.input<typeof getMealScheduleParamsSchema>;
export type GetMealScheduleResult =
  | {
      type: 'success';
      mealSchedule: { id: string; petId: string; mealName: string; scheduledTime: string; graceMinutes: number };
    }
  | { type: 'not_found' }
  | { type: 'error' };

export async function getMealSchedule(
  params: GetMealScheduleParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetMealScheduleResult> {
  const validated = getMealScheduleParamsSchema.parse(params);
  const result = await repositories.mealSchedulesRepository.findById(validated.id);

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

  logger.error('Failed to get meal schedule');
  return { type: 'error' };
}
