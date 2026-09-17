import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';
import { isLoginResponse } from '../models/login.models';
import {
  isRefreshTokenErrorResponse
} from '../models/refresh-token.models';

test.describe('Identity API - Refresh Token', () => {

  test('should refresh access token with valid refresh token', async ({ request }) => {

    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    expect(email).toBeTruthy();
    expect(password).toBeTruthy();

    const identityClient = new IdentityApiClient(request);

    // Step 1: Login
    const loginResult = await identityClient.login({
      email: email!,
      password: password!
    });

    expect(loginResult.response.status()).toBe(200);

    if (!isLoginResponse(loginResult.body)) {
      throw new Error('Expected successful login response.');
    }

    expect(loginResult.body.accessToken).toBeTruthy();
    expect(loginResult.body.refreshToken).toBeTruthy();

    const originalAccessToken = loginResult.body.accessToken;
    const originalRefreshToken = loginResult.body.refreshToken;

    // Step 2: Refresh token
    const refreshResult = await identityClient.refreshToken({
      refreshToken: originalRefreshToken
    });

    expect(refreshResult.response.status()).toBe(200);
    expect(isLoginResponse(refreshResult.body)).toBe(true);

    if (!isLoginResponse(refreshResult.body)) {
    throw new Error('Expected successful refresh token response.');
    }

    // Step 3: Validate refreshed response
    expect(refreshResult.body.userId).toBe(loginResult.body.userId);
    expect(refreshResult.body.email).toBe(email);

    expect(refreshResult.body.accessToken).toBeTruthy();
    expect(refreshResult.body.refreshToken).toBeTruthy();
    expect(refreshResult.body.expiresAtUtc).toBeTruthy();
    expect(refreshResult.body.refreshTokenExpiresAtUtc).toBeTruthy();

    // Step 4: Verify the refreshed access token works
    const meResult = await identityClient.getMe(
    refreshResult.body.accessToken
    );

    expect(meResult.response.status()).toBe(200);
    expect(meResult.body.userId).toBe(refreshResult.body.userId);
    expect(meResult.body.email).toBe(email);
  });

  test('should reject invalid refresh token', async ({ request }) => {

    const identityClient = new IdentityApiClient(request);

    const { response, body } = await identityClient.refreshToken({
        refreshToken: 'invalid-refresh-token'
    });

    expect(response.status()).toBe(401);

    expect(isRefreshTokenErrorResponse(body)).toBe(true);

    if (!isRefreshTokenErrorResponse(body)) {
        throw new Error('Expected refresh token error response.');
    }

    expect(body.title).toBe('Token refresh failed.');
    expect(body.status).toBe(401);
    expect(body.detail).toBe(
        'Invalid or expired refresh token.'
    );
    });
}

);