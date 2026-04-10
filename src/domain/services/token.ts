export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export interface TokenService {
  generate(payload: TokenPayload, expiresIn?: string | number): Promise<string>;
  generateAccessToken(payload: TokenPayload, expiresIn?: string | number): Promise<string>;
  generateRefreshToken(payload: TokenPayload, expiresIn?: string | number): Promise<string>;
  verify(token: string): Promise<TokenPayload | null>;
  verifyAccess(token: string): Promise<TokenPayload | null>;
  verifyRefresh(token: string): Promise<TokenPayload | null>;
  getTokenExpiresAt(token: string): Date | null;
}

//commeny
