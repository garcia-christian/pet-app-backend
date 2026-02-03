export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: unknown; // Allow additional claims
}

export interface TokenService {
  /**
   * Generate a token (JWT or other implementation)
   */
  generate(payload: TokenPayload, expiresIn?: string | number): Promise<string>;

  /**
   * Verify and decode a token
   */
  verify(token: string): Promise<TokenPayload | null>;
}
