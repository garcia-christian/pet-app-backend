import type { Household } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getHouseholdParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetHouseholdParams = z.input<typeof getHouseholdParamsSchema>;
export type GetHouseholdResult = { type: 'success'; household: Household } | { type: 'not_found' } | { type: 'error' };

export async function getHousehold(
  params: GetHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetHouseholdResult> {
  logger.info({ id: params.id }, 'Getting household');

  const validated = getHouseholdParamsSchema.parse(params);

  const result = await repositories.householdsRepository.findById(validated.id);

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }
    return { type: 'success', household: result.data };
  }

  if (result.error) logger.error('Failed to get household');
  return { type: 'error' };
}
