export class User {
  readonly id: string;
  readonly googleId: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;

  constructor(params: { id: string; googleId: string; email: string; name: string; avatarUrl: string | null }) {
    this.id = params.id;
    this.googleId = params.googleId;
    this.email = params.email;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
  }
}
