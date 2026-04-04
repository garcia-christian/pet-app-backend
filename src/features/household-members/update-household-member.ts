import { HouseholdRole } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const updateHouseholdMemberParamsSchema = z.object({
  id: z.string().min(1),
  role: z.nativeEnum(HouseholdRole),
});

export type UpdateHouseholdMemberParams = z.input<typeof updateHouseholdMemberParamsSchema>;
export type UpdateHouseholdMemberResult = { type: 'success'; id: string } | { type: 'not_found' } | { type: 'error' };

export async function updateHouseholdMember(
  params: UpdateHouseholdMemberParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<UpdateHouseholdMemberResult> {
  logger.info('Updating household member');

  const validated = updateHouseholdMemberParamsSchema.parse(params);

  const existing = await repositories.householdMembersRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  const result = await repositories.householdMembersRepository.update(validated.id, { role: validated.role });

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'Household member updated');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to update household member');
  return { type: 'error' };
}
