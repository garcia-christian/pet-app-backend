import { Household, HouseholdMember, HouseholdRole } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createHouseholdParamsSchema = z.object({
  name: z.string().min(1),
  userId: z.string().min(1),
});

export type CreateHouseholdParams = z.input<typeof createHouseholdParamsSchema>;
export type CreateHouseholdResult =
  | { type: 'success'; household: { id: string; name: string; inviteCode: string; createdAt: string } }
  | { type: 'user_already_owns_household' }
  | { type: 'error' };

export async function createHousehold(
  params: CreateHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateHouseholdResult> {
  logger.info('Creating household');

  const validated = createHouseholdParamsSchema.parse(params);

  // Check if user already owns a household
  const userMembershipsResult = await repositories.householdMembersRepository.findByUserId(validated.userId);

  if (userMembershipsResult.ok && userMembershipsResult.data) {
    const ownsHousehold = userMembershipsResult.data.some((member) => member.role === HouseholdRole.OWNER);
    if (ownsHousehold) {
      logger.info({ userId: validated.userId }, 'User already owns a household');
      return { type: 'user_already_owns_household' };
    }
  }

  const inviteCode = generateInviteCode();
  const householdId = crypto.randomUUID();

  const household = new Household({
    id: householdId,
    name: validated.name,
    inviteCode,
    createdAt: new Date(),
  });

  const result = await repositories.householdsRepository.create(household);

  if (result.ok && result.data) {
    logger.info({ id: result.data.id }, 'Household created');

    // Create HouseholdMember with OWNER role
    const member = new HouseholdMember({
      id: crypto.randomUUID(),
      householdId: result.data.id,
      userId: validated.userId,
      role: HouseholdRole.OWNER,
      joinedAt: new Date(),
    });

    const memberResult = await repositories.householdMembersRepository.create(member);

    if (!memberResult.ok) {
      // Rollback: delete the household if member creation fails
      logger.error({ householdId: result.data.id }, 'Failed to create household member, rolling back');
      await repositories.householdsRepository.delete(result.data.id);
      return { type: 'error' };
    }

    logger.info({ householdId: result.data.id, userId: validated.userId, role: 'OWNER' }, 'Household member created');
    return {
      type: 'success',
      household: {
        id: result.data.id,
        name: result.data.name,
        inviteCode: result.data.inviteCode,
        createdAt: result.data.createdAt.toISOString(),
      },
    };
  }

  if (!result.ok) logger.error('Failed to create household');
  return { type: 'error' };
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) {
    code += chars[byte % chars.length];
  }
  return code;
}
