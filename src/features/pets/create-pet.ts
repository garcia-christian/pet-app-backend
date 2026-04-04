import { Pet, PetType } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const createPetParamsSchema = z.object({
  householdId: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(PetType),
});

export type CreatePetParams = z.input<typeof createPetParamsSchema>;
export type CreatePetResult = { type: 'success'; id: string } | { type: 'error' };

export async function createPet(
  params: CreatePetParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<CreatePetResult> {
  logger.info('Creating pet');

  const validated = createPetParamsSchema.parse(params);

  const pet = new Pet({
    id: crypto.randomUUID(),
    householdId: validated.householdId,
    name: validated.name,
    type: validated.type,
    createdAt: new Date(),
  });

  const result = await repositories.petsRepository.create(pet);

  if (result.ok) {
    logger.info({ id: result.data?.id }, 'Pet created');
    return { type: 'success', id: result.data?.id ?? '' };
  }

  if (result.error) logger.error('Failed to create pet');
  return { type: 'error' };
}
