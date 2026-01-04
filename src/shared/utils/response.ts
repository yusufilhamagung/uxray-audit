import type { ApiResponse } from '@/shared/types/api';

export function jsonResponse<T>(payload: ApiResponse<T>, init?: ResponseInit) {
  return Response.json(payload, init);
}
