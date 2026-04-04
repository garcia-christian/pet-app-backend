import type { Household } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const updateHouseholdParamsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export type UpdateHouseholdParams = z.input<typeof updateHouseholdParamsSchema>;
export type UpdateHouseholdResult =
  | { type: 'success'; household: Household }
  | { type: 'not_found' }
  | { type: 'error' };

export async function updateHousehold(
  params: UpdateHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<UpdateHouseholdResult> {
  logger.info({ id: params.id }, 'Updating household');

  const validated = updateHouseholdParamsSchema.parse(params);

  const result = await repositories.householdsRepository.update(validated.id, {
    name: validated.name,
  });

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }
    return { type: 'success', household: result.data };
  }

  if (result.error) logger.error('Failed to update household');
  return { type: 'error' };
}
