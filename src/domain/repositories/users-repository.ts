import type { ApiResponse } from '@domain/types/api-response';
import type { User } from '../entities/user';

export interface UsersRepository {
  findById(id: string): Promise<ApiResponse<User> | null>;
  findByGoogleId(googleId: string): Promise<ApiResponse<User> | null>;
  findAll(): Promise<ApiResponse<User[]>>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<ApiResponse<User>>;
  update(id: string, data: Partial<Pick<User, 'name' | 'email' | 'avatarUrl'>>): Promise<ApiResponse<User>>;
  delete(id: string): Promise<ApiResponse<null>>;
}
