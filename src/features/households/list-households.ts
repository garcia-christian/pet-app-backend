import type { Household } from '@domain/entities';
import type { UseCaseDependencies } from '@infrastructure/di';

export type ListHouseholdsResult = { type: 'success'; households: Household[] } | { type: 'error' };

export async function listHouseholds({ logger, repositories }: UseCaseDependencies): Promise<ListHouseholdsResult> {
  logger.info('Listing households');

  const result = await repositories.householdsRepository.findAll();

  if (result.ok) {
    return { type: 'success', households: result.data ?? [] };
  }

  if (result.error) logger.error('Failed to list households');
  return { type: 'error' };
}
