export interface AuthenticatedUser {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
}