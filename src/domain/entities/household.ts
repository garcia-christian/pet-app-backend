export class Household {
  readonly id: string;
  readonly name: string;
  readonly inviteCode: string;
  readonly createdAt: Date;

  constructor(params: { id: string; name: string; inviteCode: string; createdAt: Date }) {
    this.id = params.id;
    this.name = params.name;
    this.inviteCode = params.inviteCode;
    this.createdAt = params.createdAt;
  }
}
