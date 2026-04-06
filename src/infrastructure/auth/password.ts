import type { PasswordCrypto } from '@domain/services';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10);

export const passwordCrypto: PasswordCrypto = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};
