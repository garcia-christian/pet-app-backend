import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteFeedingEventParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteFeedingEventParams = z.input<typeof deleteFeedingEventParamsSchema>;
export type DeleteFeedingEventResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteFeedingEvent(
  params: DeleteFeedingEventParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteFeedingEventResult> {
  const validated = deleteFeedingEventParamsSchema.parse(params);

  const existing = await repositories.feedingEventsRepository.findById(validated.id);
  if (existing.ok && !existing.data) return { type: 'not_found' };

  const result = await repositories.feedingEventsRepository.delete(validated.id);

  if (result.ok) return { type: 'success' };

  logger.error('Failed to delete feeding event');
  return { type: 'error' };
}
