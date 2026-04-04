import type { PetType } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const listPetsParamsSchema = z.object({
  householdId: z.string().min(1),
});

export type ListPetsParams = z.input<typeof listPetsParamsSchema>;
export type ListPetsResult =
  | { type: 'success'; pets: { id: string; householdId: string; name: string; type: PetType; createdAt: Date }[] }
  | { type: 'error' };

export async function listPets(
  params: ListPetsParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<ListPetsResult> {
  logger.info({ householdId: params.householdId }, 'Listing pets');

  const validated = listPetsParamsSchema.parse(params);

  const result = await repositories.petsRepository.findByHouseholdId(validated.householdId);

  if (result.ok) {
    const pets = (result.data ?? []).map((pet) => ({
      id: pet.id,
      householdId: pet.householdId,
      name: pet.name,
      type: pet.type,
      createdAt: pet.createdAt,
    }));
    return { type: 'success', pets };
  }

  if (result.error) logger.error('Failed to list pets');
  return { type: 'error' };
}
