export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenErrorResponse {
  title: string;
  status: number;
  detail: string;
}

export function isRefreshTokenErrorResponse(body: unknown): body is RefreshTokenErrorResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    'title' in body &&
    'status' in body &&
    'detail' in body
  );
}
