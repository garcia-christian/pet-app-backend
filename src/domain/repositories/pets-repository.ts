import type { ApiResponse } from '@domain/types/api-response';
import type { Pet } from '../entities/pet';

export interface PetsRepository {
  findById(id: string): Promise<ApiResponse<Pet>>;
  findByHouseholdId(householdId: string): Promise<ApiResponse<Pet[]>>;
  create(pet: Pet): Promise<ApiResponse<Pet>>;
  update(id: string, data: Partial<Pick<Pet, 'name' | 'type'>>): Promise<ApiResponse<Pet>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
