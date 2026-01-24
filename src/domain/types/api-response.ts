export type ApiResponse<T> = { ok: true; data: T | null } | { ok: false; error: string };
export type ApiListResponse<T> = { ok: true; data: T[] | null; total: number } | { ok: false; error: string };
