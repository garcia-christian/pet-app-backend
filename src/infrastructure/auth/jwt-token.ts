import type { TokenPayload, TokenService } from '@domain/services';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';
const EXPIRES = process.env.JWT_EXPIRES ?? '7d';

export const jwtService: TokenService = {
  async generate(payload: TokenPayload, expiresIn: string | number = EXPIRES): Promise<string> {
    return jwt.sign(payload, SECRET, { expiresIn } as unknown as Parameters<typeof jwt.sign>[2]);
  },

  async generateAccessToken(payload: TokenPayload, expiresIn: string | number = EXPIRES): Promise<string> {
    return jwt.sign(payload, SECRET, { expiresIn } as unknown as Parameters<typeof jwt.sign>[2]);
  },

  async generateRefreshToken(payload: TokenPayload, expiresIn: string | number = EXPIRES): Promise<string> {
    return jwt.sign(payload, SECRET, { expiresIn } as unknown as Parameters<typeof jwt.sign>[2]);
  },

  async verify(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, SECRET);
      return decoded as TokenPayload;
    } catch {
      return null;
    }
  },

  async verifyAccess(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, SECRET);
      return decoded as TokenPayload;
    } catch {
      return null;
    }
  },

  async verifyRefresh(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, SECRET);
      return decoded as TokenPayload;
    } catch {
      return null;
    }
  },
};
