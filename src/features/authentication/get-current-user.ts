import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getCurrentUserParamsSchema = z.object({
  userId: z.string().min(1),
});

export type GetCurrentUserParams = z.input<typeof getCurrentUserParamsSchema>;

export type GetCurrentUserResult =
  | { type: 'success'; user: { id: string; name: string; image: string | null; householdId: string | null } }
  | { type: 'not_found' }
  | { type: 'error' };

export async function getCurrentUser(
  params: GetCurrentUserParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetCurrentUserResult> {
  logger.info('Getting current user');

  const validated = getCurrentUserParamsSchema.parse(params);

  const userResult = await repositories.usersRepository.findById(validated.userId);

  if (!userResult || !userResult.ok || !userResult.data) {
    return { type: 'not_found' };
  }

  const user = userResult.data;

  // Derive householdId from HouseholdMember
  const membershipsResult = await repositories.householdMembersRepository.findByUserId(user.id);
  let householdId: string | null = null;
  if (membershipsResult.ok && membershipsResult.data && membershipsResult.data.length > 0) {
    householdId = membershipsResult.data[0].householdId;
  }

  return {
    type: 'success',
    user: {
      id: user.id,
      name: user.name,
      image: user.image,
      householdId,
    },
  };
}
