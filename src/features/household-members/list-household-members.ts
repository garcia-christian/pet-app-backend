import type { HouseholdRole } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const listHouseholdMembersParamsSchema = z.object({
  householdId: z.string().min(1),
});

export type ListHouseholdMembersParams = z.input<typeof listHouseholdMembersParamsSchema>;
export type ListHouseholdMembersResult =
  | {
      type: 'success';
      householdMembers: {
        id: string;
        householdId: string;
        userId: string;
        role: HouseholdRole;
        joinedAt: string;
      }[];
    }
  | { type: 'error' };

export async function listHouseholdMembers(
  params: ListHouseholdMembersParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<ListHouseholdMembersResult> {
  logger.info('Listing household members');

  const validated = listHouseholdMembersParamsSchema.parse(params);

  const result = await repositories.householdMembersRepository.findByHouseholdId(validated.householdId);

  if (result.ok) {
    return {
      type: 'success',
      householdMembers: (result.data ?? []).map((member) => ({
        id: member.id,
        householdId: member.householdId,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
      })),
    };
  }

  if (result.error) logger.error('Failed to list household members');
  return { type: 'error' };
}
