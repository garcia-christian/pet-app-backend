import type { ApiResponse } from '@domain/types/api-response';
import type { HouseholdMember } from '../entities/household-member';

export interface HouseholdMembersRepository {
  findById(id: string): Promise<ApiResponse<HouseholdMember>>;
  findByHouseholdId(householdId: string): Promise<ApiResponse<HouseholdMember[]>>;
  findByUserId(userId: string): Promise<ApiResponse<HouseholdMember[]>>;
  findByHouseholdAndUser(householdId: string, userId: string): Promise<ApiResponse<HouseholdMember>>;
  create(member: HouseholdMember): Promise<ApiResponse<HouseholdMember>>;
  update(id: string, data: Partial<Pick<HouseholdMember, 'role'>>): Promise<ApiResponse<HouseholdMember>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
