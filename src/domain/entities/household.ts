export class Household {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;

  constructor(params: { id: string; name: string; createdAt: Date }) {
    this.id = params.id;
    this.name = params.name;
    this.createdAt = params.createdAt;
  }
}
