import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteHouseholdParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteHouseholdParams = z.input<typeof deleteHouseholdParamsSchema>;
export type DeleteHouseholdResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteHousehold(
  params: DeleteHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteHouseholdResult> {
  logger.info({ id: params.id }, 'Deleting household');

  const validated = deleteHouseholdParamsSchema.parse(params);

  // Check if household exists first
  const existing = await repositories.householdsRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  if (!existing.ok) {
    if (existing.error) logger.error('Failed to delete household');
    return { type: 'error' };
  }

  const result = await repositories.householdsRepository.delete(validated.id);

  if (result.ok) {
    logger.info({ id: validated.id }, 'Household deleted');
    return { type: 'success' };
  }

  if (result.error) logger.error('Failed to delete household');
  return { type: 'error' };
}
