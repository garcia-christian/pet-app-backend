import type { ApiResponse } from '@domain/types/api-response';
import { Prisma, type PrismaClient, type TaskCompletion as TaskCompletionModel } from '@prisma/client';
import { TaskCompletion } from '../../domain/entities/task-completion';
import type { TaskCompletionsRepository } from '../../domain/repositories/task-completions-repository';

export function makeTaskCompletionsRepository(db: PrismaClient): TaskCompletionsRepository {
  return {
    async findById(id: string): Promise<ApiResponse<TaskCompletion>> {
      try {
        const record = await db.taskCompletion.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByTaskId(taskId: string): Promise<ApiResponse<TaskCompletion[]>> {
      try {
        const records = await db.taskCompletion.findMany({
          where: { taskId },
          orderBy: { completedAt: 'desc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(completion: TaskCompletion): Promise<ApiResponse<TaskCompletion>> {
      try {
        const record = await db.taskCompletion.create({
          data: {
            id: completion.id,
            taskId: completion.taskId,
            completedByUserId: completion.completedByUserId,
            date: completion.date,
          },
        });
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return { ok: false, error: 'duplicate_entry' };
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          return { ok: false, error: 'foreign_key_error' };
        }
        return { ok: false, error: 'persistence_error' };
      }
    },

    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        await db.taskCompletion.delete({ where: { id } });
        return { ok: true, data: null };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return { ok: true, data: null };
        }
        return { ok: false, error: 'persistence_error' };
      }
    },
  };
}

function toEntity(record: TaskCompletionModel): TaskCompletion {
  return new TaskCompletion({
    id: record.id,
    taskId: record.taskId,
    completedByUserId: record.completedByUserId,
    completedAt: record.completedAt,
    date: record.date,
  });
}
