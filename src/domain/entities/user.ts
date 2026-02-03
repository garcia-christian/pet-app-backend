export class User {
  readonly id: string;
  readonly googleId: string | null;
  readonly email: string;
  readonly password: string | null;
  readonly name: string;
  readonly avatarUrl: string | null;

  constructor(params: {
    id: string;
    googleId: string | null;
    email: string;
    password: string | null;
    name: string;
    avatarUrl: string | null;
  }) {
    this.id = params.id;
    this.googleId = params.googleId;
    this.email = params.email;
    this.password = params.password;
    this.name = params.name;
    this.avatarUrl = params.avatarUrl;
  }
}
