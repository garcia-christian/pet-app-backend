import type { ApiResponse } from '@domain/types/api-response';
import type { FeedingEvent } from '../entities/feeding-event';

export interface FeedingEventsRepository {
  findById(id: string): Promise<ApiResponse<FeedingEvent>>;
  findByMealScheduleId(mealScheduleId: string): Promise<ApiResponse<FeedingEvent[]>>;
  findByPetId(petId: string): Promise<ApiResponse<FeedingEvent[]>>;
  create(event: FeedingEvent): Promise<ApiResponse<FeedingEvent>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
