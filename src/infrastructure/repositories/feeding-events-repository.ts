import type { ApiResponse } from '@domain/types/api-response';
import { type FeedingEvent as FeedingEventModel, Prisma, type PrismaClient } from '@prisma/client';
import { FeedingEvent } from '../../domain/entities/feeding-event';
import type { FeedingEventsRepository } from '../../domain/repositories/feeding-events-repository';

export function makeFeedingEventsRepository(db: PrismaClient): FeedingEventsRepository {
  return {
    async findById(id: string): Promise<ApiResponse<FeedingEvent>> {
      try {
        const record = await db.feedingEvent.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByMealScheduleId(mealScheduleId: string): Promise<ApiResponse<FeedingEvent[]>> {
      try {
        const records = await db.feedingEvent.findMany({
          where: { mealScheduleId },
          orderBy: { fedAt: 'desc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByPetId(petId: string): Promise<ApiResponse<FeedingEvent[]>> {
      try {
        const records = await db.feedingEvent.findMany({
          where: { petId },
          orderBy: { fedAt: 'desc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(event: FeedingEvent): Promise<ApiResponse<FeedingEvent>> {
      try {
        const record = await db.feedingEvent.create({
          data: {
            id: event.id,
            petId: event.petId,
            mealScheduleId: event.mealScheduleId,
            userId: event.userId,
            fedAt: event.fedAt,
            remarks: event.remarks,
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

    async delete(id: string): Promise<ApiResponse<null>> {
      try {
        await db.feedingEvent.delete({ where: { id } });
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

function toEntity(record: FeedingEventModel): FeedingEvent {
  return new FeedingEvent({
    id: record.id,
    petId: record.petId,
    mealScheduleId: record.mealScheduleId,
    userId: record.userId,
    fedAt: record.fedAt,
    remarks: record.remarks,
    createdAt: record.createdAt,
  });
}
