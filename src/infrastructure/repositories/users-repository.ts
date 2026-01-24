import type { ApiResponse } from '@domain/types/api-response';
import { Prisma, type PrismaClient, type User as UserModel } from '@prisma/client';
import { User } from '../../domain/entities/user';
import type { UsersRepository } from '../../domain/repositories/users-repository';

export function makeUsersRepository(db: PrismaClient): UsersRepository {
  return {
    async create(user: User): Promise<ApiResponse<User>> {
      try {
        const record = await db.user.create({
          data: {
            id: user.id,
            googleId: user.googleId,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
        });
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return { ok: false, error: 'duplicate_id' };
        }
        return { ok: false, error: 'persistence_error' };
      }
    },
    async findById(id: string): Promise<ApiResponse<User>> {
      try {
        const record = await db.user.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'persistence_error';
        return { ok: false, error: message };
      }
    },
    async findByGoogleId(googleId: string): Promise<ApiResponse<User>> {
      try {
        const record = await db.user.findUnique({ where: { googleId } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'persistence_error';
        return { ok: false, error: message };
      }
    },
  };
}

function toEntity(record: UserModel): User {
  return new User({
    id: record.id,
    googleId: record.googleId,
    name: record.name,
    email: record.email,
    avatarUrl: record.avatarUrl,
  });
}
