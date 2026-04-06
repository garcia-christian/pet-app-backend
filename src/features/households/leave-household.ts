import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const leaveHouseholdParamsSchema = z.object({
  householdId: z.string().min(1),
  userId: z.string().min(1),
});

export type LeaveHouseholdParams = z.input<typeof leaveHouseholdParamsSchema>;

export type LeaveHouseholdResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function leaveHousehold(
  params: LeaveHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<LeaveHouseholdResult> {
  logger.info('Leaving household');

  const validated = leaveHouseholdParamsSchema.parse(params);

  const memberResult = await repositories.householdMembersRepository.findByHouseholdAndUser(
    validated.householdId,
    validated.userId,
  );

  if (!memberResult.ok || !memberResult.data) {
    return { type: 'not_found' };
  }

  const deleteResult = await repositories.householdMembersRepository.delete(memberResult.data.id);

  if (!deleteResult.ok) {
    logger.error('Failed to remove household member');
    return { type: 'error' };
  }

  return { type: 'success' };
}
