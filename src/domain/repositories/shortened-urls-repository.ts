import type { ShortenedUrl } from '../entities';
import type { ApiResponse } from '../types/api-response';

export interface ShortenedUrlsRepository {
  create(shortenedUrl: ShortenedUrl): Promise<ApiResponse<ShortenedUrl>>;
  getById(id: string): Promise<ShortenedUrl | null>;
}
