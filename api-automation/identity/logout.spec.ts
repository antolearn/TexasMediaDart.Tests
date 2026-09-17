import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';
import { isLoginResponse } from '../models/login.models';
import {
  isRefreshTokenErrorResponse
} from '../models/refresh-token.models';

test.describe('Identity API - Logout', () => {

  test('should invalidate refresh token after logout', 
    { tag: ['@regression'] },
    async ({ request }) => {

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

    const refreshToken = loginResult.body.refreshToken;

    expect(refreshToken).toBeTruthy();

    // Step 2: Logout
    const logoutResponse = await identityClient.logout({
      refreshToken
    });

    expect(logoutResponse.status()).toBe(204);

    // Step 3: Attempt to use the logged-out refresh token
    const refreshResult = await identityClient.refreshToken({
      refreshToken
    });

    expect(refreshResult.response.status()).toBe(401);

    if (!isRefreshTokenErrorResponse(refreshResult.body)) {
      throw new Error(
        'Expected refresh token error response after logout.'
      );
    }

    expect(refreshResult.body.title)
      .toBe('Token refresh failed.');

    expect(refreshResult.body.status)
      .toBe(401);

    expect(refreshResult.body.detail)
      .toBe('Invalid or expired refresh token.');
  });

});