export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export interface TokenService {
  generateAccessToken(payload: TokenPayload, expiresIn?: string | number): Promise<string>;
  generateRefreshToken(payload: TokenPayload, expiresIn?: string | number): Promise<string>;
  verifyAccess(token: string): Promise<TokenPayload | null>;
  verifyRefresh(token: string): Promise<TokenPayload | null>;
}

//commeny
