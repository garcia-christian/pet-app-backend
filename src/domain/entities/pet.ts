import type { PetType } from './enums';

export class Pet {
  readonly id: string;
  readonly householdId: string;
  readonly name: string;
  readonly type: PetType;
  readonly createdAt: Date;

  constructor(params: {
    id: string;
    householdId: string;
    name: string;
    type: PetType;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.householdId = params.householdId;
    this.name = params.name;
    this.type = params.type;
    this.createdAt = params.createdAt;
  }
}
