import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const listMealSchedulesParamsSchema = z.object({
  petId: z.string().min(1),
});

export type ListMealSchedulesParams = z.input<typeof listMealSchedulesParamsSchema>;
export type ListMealSchedulesResult =
  | {
      type: 'success';
      mealSchedules: { id: string; petId: string; mealName: string; scheduledTime: string; graceMinutes: number }[];
    }
  | { type: 'error' };

export async function listMealSchedules(
  params: ListMealSchedulesParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<ListMealSchedulesResult> {
  const validated = listMealSchedulesParamsSchema.parse(params);
  const result = await repositories.mealSchedulesRepository.findByPetId(validated.petId);

  if (result.ok) {
    return {
      type: 'success',
      mealSchedules: (result.data ?? []).map((ms) => ({
        id: ms.id,
        petId: ms.petId,
        mealName: ms.mealName,
        scheduledTime: ms.scheduledTime,
        graceMinutes: ms.graceMinutes,
      })),
    };
  }

  logger.error('Failed to list meal schedules');
  return { type: 'error' };
}
