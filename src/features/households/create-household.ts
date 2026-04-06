import { Household } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createHouseholdParamsSchema = z.object({
  name: z.string().min(1),
});

export type CreateHouseholdParams = z.input<typeof createHouseholdParamsSchema>;
export type CreateHouseholdResult =
  | { type: 'success'; household: { id: string; name: string; inviteCode: string; createdAt: string } }
  | { type: 'error' };

export async function createHousehold(
  params: CreateHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateHouseholdResult> {
  logger.info('Creating household');

  const validated = createHouseholdParamsSchema.parse(params);

  const inviteCode = generateInviteCode();

  const household = new Household({
    id: crypto.randomUUID(),
    name: validated.name,
    inviteCode,
    createdAt: new Date(),
  });

  const result = await repositories.householdsRepository.create(household);

  if (result.ok && result.data) {
    logger.info({ id: result.data.id }, 'Household created');
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
