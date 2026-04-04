import type { HouseholdRole } from './enums';

export class HouseholdMember {
  readonly id: string;
  readonly householdId: string;
  readonly userId: string;
  readonly role: HouseholdRole;
  readonly joinedAt: Date;

  constructor(params: {
    id: string;
    householdId: string;
    userId: string;
    role: HouseholdRole;
    joinedAt: Date;
  }) {
    this.id = params.id;
    this.householdId = params.householdId;
    this.userId = params.userId;
    this.role = params.role;
    this.joinedAt = params.joinedAt;
  }
}
