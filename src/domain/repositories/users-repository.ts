import type { ApiResponse } from '@domain/types/api-response';
import type { User } from '../entities/user';

export interface UsersRepository {
  findById(id: string): Promise<ApiResponse<User> | null>;
  findByGoogleId(googleId: string): Promise<ApiResponse<User> | null>;
  create(user: User): Promise<ApiResponse<User>>;
}
