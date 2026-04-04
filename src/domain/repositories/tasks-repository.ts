import type { ApiResponse } from '@domain/types/api-response';
import type { Task } from '../entities/task';

export interface TasksRepository {
  findById(id: string): Promise<ApiResponse<Task>>;
  findByHouseholdId(householdId: string): Promise<ApiResponse<Task[]>>;
  create(task: Task): Promise<ApiResponse<Task>>;
  update(
    id: string,
    data: Partial<Pick<Task, 'title' | 'taskType' | 'scheduleType' | 'petId'>>,
  ): Promise<ApiResponse<Task>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
