import { Household } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createHouseholdParamsSchema = z.object({
  name: z.string().min(1),
});

export type CreateHouseholdParams = z.input<typeof createHouseholdParamsSchema>;
export type CreateHouseholdResult = { type: 'success'; id: string } | { type: 'error' };

export async function createHousehold(
  params: CreateHouseholdParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreateHouseholdResult> {
  logger.info('Creating household');

  const validated = createHouseholdParamsSchema.parse(params);

  const household = new Household({
    id: crypto.randomUUID(),
    name: validated.name,
    createdAt: new Date(),
  });

  const result = await repositories.householdsRepository.create(household);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'Household created');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to create household');
  return { type: 'error' };
}
