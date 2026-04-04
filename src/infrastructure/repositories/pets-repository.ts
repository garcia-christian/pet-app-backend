import type { ApiResponse } from '@domain/types/api-response';
import { type Pet as PetModel, Prisma, type PrismaClient } from '@prisma/client';
import type { PetType } from '../../domain/entities/enums';
import { Pet } from '../../domain/entities/pet';
import type { PetsRepository } from '../../domain/repositories/pets-repository';

export function makePetsRepository(db: PrismaClient): PetsRepository {
  return {
    async findById(id: string): Promise<ApiResponse<Pet>> {
      try {
        const record = await db.pet.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByHouseholdId(householdId: string): Promise<ApiResponse<Pet[]>> {
      try {
        const records = await db.pet.findMany({
          where: { householdId },
          orderBy: { createdAt: 'desc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(pet: Pet): Promise<ApiResponse<Pet>> {
      try {
        const record = await db.pet.create({
          data: {
            id: pet.id,
            householdId: pet.householdId,
            name: pet.name,
            type: pet.type,
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

    async update(id: string, data: Partial<Pick<Pet, 'name' | 'type'>>): Promise<ApiResponse<Pet>> {
      try {
        const record = await db.pet.update({ where: { id }, data });
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
        await db.pet.delete({ where: { id } });
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

function toEntity(record: PetModel): Pet {
  return new Pet({
    id: record.id,
    householdId: record.householdId,
    name: record.name,
    type: record.type as PetType,
    createdAt: record.createdAt,
  });
}
