import type { ApiResponse } from '@domain/types/api-response';
import type { MealSchedule } from '../entities/meal-schedule';

export interface MealSchedulesRepository {
  findById(id: string): Promise<ApiResponse<MealSchedule>>;
  findByPetId(petId: string): Promise<ApiResponse<MealSchedule[]>>;
  create(mealSchedule: MealSchedule): Promise<ApiResponse<MealSchedule>>;
  update(
    id: string,
    data: Partial<Pick<MealSchedule, 'mealName' | 'scheduledTime' | 'graceMinutes'>>,
  ): Promise<ApiResponse<MealSchedule>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
