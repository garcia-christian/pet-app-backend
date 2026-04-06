import type { ApiResponse } from '@domain/types/api-response';
import { type MealSchedule as MealScheduleModel, Prisma, type PrismaClient } from '@prisma/client';
import { MealSchedule } from '../../domain/entities/meal-schedule';
import type { MealSchedulesRepository } from '../../domain/repositories/meal-schedules-repository';

export function makeMealSchedulesRepository(db: PrismaClient): MealSchedulesRepository {
  return {
    async findById(id: string): Promise<ApiResponse<MealSchedule>> {
      try {
        const record = await db.mealSchedule.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByPetId(petId: string): Promise<ApiResponse<MealSchedule[]>> {
      try {
        const records = await db.mealSchedule.findMany({
          where: { petId },
          orderBy: { scheduledTime: 'asc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(mealSchedule: MealSchedule): Promise<ApiResponse<MealSchedule>> {
      try {
        const record = await db.mealSchedule.create({
          data: {
            id: mealSchedule.id,
            petId: mealSchedule.petId,
            mealName: mealSchedule.mealName,
            scheduledTime: mealSchedule.scheduledTime,
            graceMinutes: mealSchedule.graceMinutes,
          },
        });
        return { ok: true, data: toEntity(record) };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
          return { ok: false, error: 'foreign_key_error' };
        }
        return { ok: false, error: 'persistence_error' };
      }
    },

    async update(
      id: string,
      data: Partial<Pick<MealSchedule, 'mealName' | 'scheduledTime' | 'graceMinutes'>>,
    ): Promise<ApiResponse<MealSchedule>> {
      try {
        const record = await db.mealSchedule.update({ where: { id }, data });
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
        await db.mealSchedule.delete({ where: { id } });
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

function toEntity(record: MealScheduleModel): MealSchedule {
  return new MealSchedule({
    id: record.id,
    petId: record.petId,
    mealName: record.mealName,
    scheduledTime: record.scheduledTime,
    graceMinutes: record.graceMinutes,
    createdAt: record.createdAt,
  });
}
