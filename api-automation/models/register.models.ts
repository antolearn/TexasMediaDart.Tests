export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}
export interface RegisterErrorResponse {
  title: string;
  status: number;
  detail: string;
}
export function isRegisterErrorResponse(
  body: unknown
): body is RegisterErrorResponse {

  return (
    typeof body === 'object' &&
    body !== null &&
    'title' in body &&
    'status' in body &&
    'detail' in body
  );
}
export function isRegisterResponse(
  body: unknown
): body is RegisterResponse {

  return (
    typeof body === 'object' &&
    body !== null &&
    'userId' in body &&
    'email' in body
  );
}
export interface RegisterValidationErrorResponse {
  title: string;
  status: number;
  errors: Record<string, string[]>;
}

export function isRegisterValidationErrorResponse(
  body: unknown
): body is RegisterValidationErrorResponse {

  return (
    typeof body === 'object' &&
    body !== null &&
    'title' in body &&
    'status' in body &&
    'errors' in body
  );
}