type ApiResponse<T> = {
  status: string;
  message: string;
  data?: T;
};

export function jsonResponse<T>(payload: ApiResponse<T>, init?: ResponseInit) {
  return Response.json(payload, init);
}
