import type { TokenPayload, TokenService } from '@domain/services';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES ?? '7d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? SECRET;

export const jwtService: TokenService = {
  async generate(payload: TokenPayload, expiresIn: string | number = ACCESS_EXPIRES): Promise<string> {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn } as unknown as Parameters<typeof jwt.sign>[2]);
  },

  async generateAccessToken(payload: TokenPayload, expiresIn: string | number = ACCESS_EXPIRES): Promise<string> {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn } as unknown as Parameters<typeof jwt.sign>[2]);
  },

  async generateRefreshToken(payload: TokenPayload, expiresIn: string | number = REFRESH_EXPIRES): Promise<string> {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn } as unknown as Parameters<typeof jwt.sign>[2]);
  },

  async verify(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      return decoded as TokenPayload;
    } catch {
      try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        return decoded as TokenPayload;
      } catch {
        return null;
      }
    }
  },

  async verifyAccess(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      return decoded as TokenPayload;
    } catch {
      return null;
    }
  },

  async verifyRefresh(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET);
      return decoded as TokenPayload;
    } catch {
      return null;
    }
  },

  getTokenExpiresAt(token: string): Date | null {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || typeof decoded === 'string') {
        return null;
      }
      const exp = decoded.exp;
      if (typeof exp !== 'number') {
        return null;
      }
      return new Date(exp * 1000);
    } catch {
      return null;
    }
  },
};
