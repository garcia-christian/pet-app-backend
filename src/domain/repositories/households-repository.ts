import type { ApiResponse } from '@domain/types/api-response';
import type { Household } from '../entities/household';

export interface HouseholdsRepository {
  findById(id: string): Promise<ApiResponse<Household>>;
  findByInviteCode(inviteCode: string): Promise<ApiResponse<Household>>;
  findAll(): Promise<ApiResponse<Household[]>>;
  create(household: Household): Promise<ApiResponse<Household>>;
  update(id: string, data: Partial<Pick<Household, 'name'>>): Promise<ApiResponse<Household>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
