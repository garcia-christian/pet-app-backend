import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteMealScheduleParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteMealScheduleParams = z.input<typeof deleteMealScheduleParamsSchema>;
export type DeleteMealScheduleResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteMealSchedule(
  params: DeleteMealScheduleParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteMealScheduleResult> {
  const validated = deleteMealScheduleParamsSchema.parse(params);

  const existing = await repositories.mealSchedulesRepository.findById(validated.id);
  if (existing.ok && !existing.data) return { type: 'not_found' };

  const result = await repositories.mealSchedulesRepository.delete(validated.id);

  if (result.ok) return { type: 'success' };

  logger.error('Failed to delete meal schedule');
  return { type: 'error' };
}
