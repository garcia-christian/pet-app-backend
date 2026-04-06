import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const listFeedingEventsParamsSchema = z.object({
  petId: z.string().min(1).optional(),
  mealScheduleId: z.string().min(1).optional(),
});

export type ListFeedingEventsParams = z.input<typeof listFeedingEventsParamsSchema>;
export type ListFeedingEventsResult =
  | {
      type: 'success';
      feedingEvents: {
        id: string;
        petId: string;
        mealScheduleId: string;
        userId: string;
        fedAt: string;
        remarks: string | null;
        createdAt: string;
      }[];
    }
  | { type: 'error' };

export async function listFeedingEvents(
  params: ListFeedingEventsParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<ListFeedingEventsResult> {
  const validated = listFeedingEventsParamsSchema.parse(params);

  const result = validated.mealScheduleId
    ? await repositories.feedingEventsRepository.findByMealScheduleId(validated.mealScheduleId)
    : validated.petId
      ? await repositories.feedingEventsRepository.findByPetId(validated.petId)
      : null;

  if (!result) {
    return { type: 'error' };
  }

  if (result.ok) {
    return {
      type: 'success',
      feedingEvents: (result.data ?? []).map((e) => ({
        id: e.id,
        petId: e.petId,
        mealScheduleId: e.mealScheduleId,
        userId: e.userId,
        fedAt: e.fedAt.toISOString(),
        remarks: e.remarks,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }

  logger.error('Failed to list feeding events');
  return { type: 'error' };
}
