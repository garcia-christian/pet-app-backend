import type { ApiResponse } from '@domain/types/api-response';
import { type Household as HouseholdModel, Prisma, type PrismaClient } from '@prisma/client';
import { Household } from '../../domain/entities/household';
import type { HouseholdsRepository } from '../../domain/repositories/households-repository';

export function makeHouseholdsRepository(db: PrismaClient): HouseholdsRepository {
  return {
    async findById(id: string): Promise<ApiResponse<Household>> {
      try {
        const record = await db.household.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByInviteCode(inviteCode: string): Promise<ApiResponse<Household>> {
      try {
        const record = await db.household.findUnique({ where: { inviteCode } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findAll(): Promise<ApiResponse<Household[]>> {
      try {
        const records = await db.household.findMany({ orderBy: { createdAt: 'desc' } });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(household: Household): Promise<ApiResponse<Household>> {
      try {
        const record = await db.household.create({
          data: {
            id: household.id,
            name: household.name,
            inviteCode: household.inviteCode,
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

    async update(id: string, data: Partial<Pick<Household, 'name'>>): Promise<ApiResponse<Household>> {
      try {
        const record = await db.household.update({ where: { id }, data });
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
        await db.household.delete({ where: { id } });
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

function toEntity(record: HouseholdModel): Household {
  return new Household({
    id: record.id,
    name: record.name,
    inviteCode: record.inviteCode,
    createdAt: record.createdAt,
  });
}
