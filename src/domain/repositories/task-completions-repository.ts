import type { ApiResponse } from '@domain/types/api-response';
import type { TaskCompletion } from '../entities/task-completion';

export interface TaskCompletionsRepository {
  findById(id: string): Promise<ApiResponse<TaskCompletion>>;
  findByTaskId(taskId: string): Promise<ApiResponse<TaskCompletion[]>>;
  create(completion: TaskCompletion): Promise<ApiResponse<TaskCompletion>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
