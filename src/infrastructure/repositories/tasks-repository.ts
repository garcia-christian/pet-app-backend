import type { ApiResponse } from '@domain/types/api-response';
import { Prisma, type PrismaClient, type Task as TaskModel } from '@prisma/client';
import type { TaskScheduleType, TaskType } from '../../domain/entities/enums';
import { Task } from '../../domain/entities/task';
import type { TasksRepository } from '../../domain/repositories/tasks-repository';

export function makeTasksRepository(db: PrismaClient): TasksRepository {
  return {
    async findById(id: string): Promise<ApiResponse<Task>> {
      try {
        const record = await db.task.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByHouseholdId(householdId: string): Promise<ApiResponse<Task[]>> {
      try {
        const records = await db.task.findMany({
          where: { householdId },
          orderBy: { createdAt: 'desc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(task: Task): Promise<ApiResponse<Task>> {
      try {
        const record = await db.task.create({
          data: {
            id: task.id,
            householdId: task.householdId,
            petId: task.petId,
            title: task.title,
            taskType: task.taskType,
            scheduleType: task.scheduleType,
          },
        });
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return { ok: false, error: 'duplicate_id' };
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          return { ok: false, error: 'foreign_key_error' };
        }
        return { ok: false, error: 'persistence_error' };
      }
    },

    async update(
      id: string,
      data: Partial<Pick<Task, 'title' | 'taskType' | 'scheduleType' | 'petId'>>,
    ): Promise<ApiResponse<Task>> {
      try {
        const record = await db.task.update({ where: { id }, data });
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          return { ok: true, data: null };
        }
        return { ok: false, error: 'persistence_error' };
      }
    },

    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        await db.task.delete({ where: { id } });
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

function toEntity(record: TaskModel): Task {
  return new Task({
    id: record.id,
    householdId: record.householdId,
    petId: record.petId,
    title: record.title,
    taskType: record.taskType as TaskType,
    scheduleType: record.scheduleType as TaskScheduleType,
    createdAt: record.createdAt,
  });
}
