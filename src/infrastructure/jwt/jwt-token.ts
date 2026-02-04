import type { TokenPayload, TokenService } from '@domain/services';
import jwt, { type SignOptions } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const jwtService: TokenService = {
  async generate(payload: TokenPayload, expiresIn: number = 100000): Promise<string> {
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, SECRET, options);
  },

  async verify(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, SECRET);
      return decoded as TokenPayload;
    } catch {
      return null;
    }
  },
};
