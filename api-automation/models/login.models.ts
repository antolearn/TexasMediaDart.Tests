export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  accessToken: string;
  expiresAtUtc: string;
  refreshToken: string;
  refreshTokenExpiresAtUtc: string;
}
export interface LoginErrorResponse {
  title: string;
  status: number;
  detail: string;
}
export function isLoginResponse(body: LoginResponse | LoginErrorResponse): body is LoginResponse {
  return 'accessToken' in body;
}

export function isLoginErrorResponse(
  body: LoginResponse | LoginErrorResponse
): body is LoginErrorResponse {
  return 'status' in body && 'detail' in body;
}
