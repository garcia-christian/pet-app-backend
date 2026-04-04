import type { UseCaseDependencies } from '@infrastructure/di';
import { z } from 'zod';

const deletePetParamsSchema = z.object({
  id: z.string().min(1),
});

export type DeletePetParams = z.input<typeof deletePetParamsSchema>;
export type DeletePetResult = { type: 'success' } | { type: 'not_found' } | { type: 'error' };

export async function deletePet(
  params: DeletePetParams,
  { logger, repositories }: UseCaseDependencies,
): Promise<DeletePetResult> {
  logger.info({ id: params.id }, 'Deleting pet');

  const validated = deletePetParamsSchema.parse(params);

  const existing = await repositories.petsRepository.findById(validated.id);

  if (existing.ok && !existing.data) {
    return { type: 'not_found' };
  }

  if (!existing.ok) {
    if (existing.error) logger.error('Failed to find pet for deletion');
    return { type: 'error' };
  }

  const result = await repositories.petsRepository.delete(validated.id);

  if (result.ok) {
    logger.info({ id: validated.id }, 'Pet deleted');
    return { type: 'success' };
  }

  if (result.error) logger.error('Failed to delete pet');
  return { type: 'error' };
}
