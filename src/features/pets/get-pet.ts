import type { PetType } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const getPetParamsSchema = z.object({
  id: z.string().min(1),
});

export type GetPetParams = z.input<typeof getPetParamsSchema>;
export type GetPetResult =
  | { type: 'success'; pet: { id: string; householdId: string; name: string; type: PetType; createdAt: Date } }
  | { type: 'not_found' }
  | { type: 'error' };

export async function getPet(
  params: GetPetParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<GetPetResult> {
  logger.info({ id: params.id }, 'Getting pet');

  const validated = getPetParamsSchema.parse(params);

  const result = await repositories.petsRepository.findById(validated.id);

  if (result.ok) {
    if (!result.data) {
      return { type: 'not_found' };
    }
    return {
      type: 'success',
      pet: {
        id: result.data.id,
        householdId: result.data.householdId,
        name: result.data.name,
        type: result.data.type,
        createdAt: result.data.createdAt,
      },
    };
  }

  if (result.error) logger.error('Failed to get pet');
  return { type: 'error' };
}
