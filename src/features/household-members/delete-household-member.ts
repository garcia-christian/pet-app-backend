import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deleteHouseholdMemberParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeleteHouseholdMemberParams = z.input<typeof deleteHouseholdMemberParamsSchema>;
export type DeleteHouseholdMemberResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deleteHouseholdMember(
  params: DeleteHouseholdMemberParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeleteHouseholdMemberResult> {
  logger.info('Deleting household member');

  const validated = deleteHouseholdMemberParamsSchema.parse(params);

  const existing = await repositories.householdMembersRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  const result = await repositories.householdMembersRepository.delete(validated.id);

  if (result.ok) {
    logger.info({ id: validated.id }, 'Household member deleted');
    return { type: 'success' };
  }

  if (result.error) logger.error('Failed to delete household member');
  return { type: 'error' };
}
