import type { HouseholdRole } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getHouseholdMemberParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetHouseholdMemberParams = z.input<typeof getHouseholdMemberParamsSchema>;
export type GetHouseholdMemberResult =
  | {
      type: 'success';
      householdMember: {
        id: string;
        householdId: string;
        userId: string;
        role: HouseholdRole;
        joinedAt: string;
      };
    }
  | { type: 'not_found' }
  | { type: 'error' };

export async function getHouseholdMember(
  params: GetHouseholdMemberParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetHouseholdMemberResult> {
  logger.info('Getting household member');

  const validated = getHouseholdMemberParamsSchema.parse(params);

  const result = await repositories.householdMembersRepository.findById(validated.id);

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }

    return {
      type: 'success',
      householdMember: {
        id: result.data.id,
        householdId: result.data.householdId,
        userId: result.data.userId,
        role: result.data.role,
        joinedAt: result.data.joinedAt.toISOString(),
      },
    };
  }

  if (result.error) logger.error('Failed to get household member');
  return { type: 'error' };
}
