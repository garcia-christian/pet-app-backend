import { FeedingEvent } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createFeedingEventParamsSchema = z.object({
  petId: z.string().min(1),
  mealScheduleId: z.string().min(1),
  userId: z.string().min(1),
  fedAt: z.string().datetime().optional(),
  remarks: z.string().nullable().default(null),
});

export type CreateFeedingEventParams = z.input<typeof createFeedingEventParamsSchema>;
export type CreateFeedingEventResult =
  | {
      type: 'success';
      feedingEvent: {
        id: string;
        petId: string;
        mealScheduleId: string;
        userId: string;
        fedAt: string;
        remarks: string | null;
        createdAt: string;
      };
    }
  | { type: 'error' };

export async function createFeedingEvent(
  params: CreateFeedingEventParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateFeedingEventResult> {
  logger.info('Creating feeding event');

  const validated = createFeedingEventParamsSchema.parse(params);

  const event = new FeedingEvent({
    id: crypto.randomUUID(),
    petId: validated.petId,
    mealScheduleId: validated.mealScheduleId,
    userId: validated.userId,
    fedAt: validated.fedAt ? new Date(validated.fedAt) : new Date(),
    remarks: validated.remarks,
    createdAt: new Date(),
  });

  const result = await repositories.feedingEventsRepository.create(event);

  if (result.ok && result.data) {
    return {
      type: 'success',
      feedingEvent: {
        id: result.data.id,
        petId: result.data.petId,
        mealScheduleId: result.data.mealScheduleId,
        userId: result.data.userId,
        fedAt: result.data.fedAt.toISOString(),
        remarks: result.data.remarks,
        createdAt: result.data.createdAt.toISOString(),
      },
    };
  }

  logger.error('Failed to create feeding event');
  return { type: 'error' };
}
