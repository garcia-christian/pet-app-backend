import type { ApiResponse } from '@domain/types/api-response';
import { type HouseholdMember as HouseholdMemberModel, Prisma, type PrismaClient } from '@prisma/client';
import type { HouseholdRole } from '../../domain/entities/enums';
import { HouseholdMember } from '../../domain/entities/household-member';
import type { HouseholdMembersRepository } from '../../domain/repositories/household-members-repository';

export function makeHouseholdMembersRepository(db: PrismaClient): HouseholdMembersRepository {
  return {
    async findById(id: string): Promise<ApiResponse<HouseholdMember>> {
      try {
        const record = await db.householdMember.findUnique({ where: { id } });
        if (!record) {
          return { ok: true, data: null };
        }
        return { ok: true, data: toEntity(record) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async findByHouseholdId(householdId: string): Promise<ApiResponse<HouseholdMember[]>> {
      try {
        const records = await db.householdMember.findMany({
          where: { householdId },
          orderBy: { joinedAt: 'desc' },
        });
        return { ok: true, data: records.map(toEntity) };
      } catch {
        return { ok: false, error: 'persistence_error' };
      }
    },

    async create(member: HouseholdMember): Promise<ApiResponse<HouseholdMember>> {
      try {
        const record = await db.householdMember.create({
          data: {
            id: member.id,
            householdId: member.householdId,
            userId: member.userId,
            role: member.role,
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

    async update(id: string, data: Partial<Pick<HouseholdMember, 'role'>>): Promise<ApiResponse<HouseholdMember>> {
      try {
        const record = await db.householdMember.update({ where: { id }, data });
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
        await db.householdMember.delete({ where: { id } });
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

function toEntity(record: HouseholdMemberModel): HouseholdMember {
  return new HouseholdMember({
    id: record.id,
    householdId: record.householdId,
    userId: record.userId,
    role: record.role as HouseholdRole,
    joinedAt: record.joinedAt,
  });
}
