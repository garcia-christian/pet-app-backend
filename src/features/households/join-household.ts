import { HouseholdMember, HouseholdRole } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const joinHouseholdParamsSchema = z.object({
  inviteCode: z.string().min(1),
  userId: z.string().min(1),
});

export type JoinHouseholdParams = z.input<typeof joinHouseholdParamsSchema>;

export type JoinHouseholdResult =
  | { type: 'success'; user: { id: string; name: string; image: string | null; householdId: string } }
  | { type: 'household_not_found' }
  | { type: 'already_member' }
  | { type: 'error' };

export async function joinHousehold(
  params: JoinHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<JoinHouseholdResult> {
  logger.info('Joining household by invite code');

  const validated = joinHouseholdParamsSchema.parse(params);

  const householdResult = await repositories.householdsRepository.findByInviteCode(validated.inviteCode);

  if (!householdResult.ok || !householdResult.data) {
    return { type: 'household_not_found' };
  }

  const household = householdResult.data;

  // Check if already a member
  const existingResult = await repositories.householdMembersRepository.findByHouseholdAndUser(
    household.id,
    validated.userId,
  );
  if (existingResult.ok && existingResult.data) {
    return { type: 'already_member' };
  }

  const member = new HouseholdMember({
    id: crypto.randomUUID(),
    householdId: household.id,
    userId: validated.userId,
    role: HouseholdRole.MEMBER,
    joinedAt: new Date(),
  });

  const createResult = await repositories.householdMembersRepository.create(member);

  if (!createResult.ok) {
    logger.error('Failed to create household member');
    return { type: 'error' };
  }

  // Fetch user to return
  const userResult = await repositories.usersRepository.findById(validated.userId);
  if (!userResult || !userResult.ok || !userResult.data) {
    return { type: 'error' };
  }

  const user = userResult.data;
  return {
    type: 'success',
    user: {
      id: user.id,
      name: user.name,
      image: user.image,
      householdId: household.id,
    },
  };
}
