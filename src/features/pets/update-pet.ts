import { PetType } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const updatePetParamsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  type: z.nativeEnum(PetType).optional(),
});

export type UpdatePetParams = z.input<typeof updatePetParamsSchema>;
export type UpdatePetResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function updatePet(
  params: UpdatePetParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<UpdatePetResult> {
  logger.info({ id: params.id }, 'Updating pet');

  const validated = updatePetParamsSchema.parse(params);

  const existing = await repositories.petsRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  if (!existing.ok) {
    if (existing.error) logger.error('Failed to find pet for update');
    return { type: 'error' };
  }

  const updateData: Partial<{ name: string; type: PetType }> = {};
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.type !== undefined) updateData.type = validated.type;

  const result = await repositories.petsRepository.update(validated.id, updateData);

  if (result.ok) {
    logger.info({ id: validated.id }, 'Pet updated');
    return { type: 'success' };
  }

  if (result.error) logger.error('Failed to update pet');
  return { type: 'error' };
}
