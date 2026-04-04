import { HouseholdMember, HouseholdRole } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createHouseholdMemberParamsSchema = z.object({
  householdId: z.string().min(1),
  userId: z.string().min(1),
  role: z.nativeEnum(HouseholdRole).default(HouseholdRole.MEMBER),
});

export type CreateHouseholdMemberParams = z.input<typeof createHouseholdMemberParamsSchema>;
export type CreateHouseholdMemberResult = { type: 'success'; id: string } | { type: 'error' };

export async function createHouseholdMember(
  params: CreateHouseholdMemberParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateHouseholdMemberResult> {
  logger.info('Creating household member');

  const validated = createHouseholdMemberParamsSchema.parse(params);

  const householdMember = new HouseholdMember({
    id: crypto.randomUUID(),
    householdId: validated.householdId,
    userId: validated.userId,
    role: validated.role,
    joinedAt: new Date(),
  });

  const result = await repositories.householdMembersRepository.create(householdMember);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'Household member created');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to create household member');
  return { type: 'error' };
}
