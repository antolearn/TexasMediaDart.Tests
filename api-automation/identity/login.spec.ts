import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';
import { isLoginResponse, isLoginErrorResponse } from '../models/login.models';

test.describe('Identity API - Login', () => {
  test(
    'should login successfully with valid credentials',
    { tag: ['@smoke', '@regression'] },
    async ({ request }) => {
      const email = process.env.TEST_EMAIL;
      const password = process.env.TEST_PASSWORD;

      expect(email).toBeTruthy();
      expect(password).toBeTruthy();

      const identityClient = new IdentityApiClient(request);

      const { response, body } = await identityClient.login({
        email: email!,
        password: password!
      });

      expect(response.status()).toBe(200);
      expect(isLoginResponse(body)).toBe(true);

      if (!isLoginResponse(body)) {
        throw new Error('Expected successful login response.');
      }

      expect(body.userId).toBeTruthy();
      expect(body.email).toBe(email);
      expect(body.accessToken).toBeTruthy();
      expect(body.expiresAtUtc).toBeTruthy();
      expect(body.refreshToken).toBeTruthy();
      expect(body.refreshTokenExpiresAtUtc).toBeTruthy();
    }
  );
  test(
    'should reject login with invalid password',
    { tag: ['@regression'] },
    async ({ request }) => {
      const email = process.env.TEST_EMAIL;

      expect(email).toBeTruthy();

      const identityClient = new IdentityApiClient(request);

      const { response, body } = await identityClient.login({
        email: email!,
        password: 'InvalidPassword123!'
      });

      expect(response.status()).toBe(401);
      expect(isLoginErrorResponse(body)).toBe(true);

      if (!isLoginErrorResponse(body)) {
        throw new Error('Expected login error response.');
      }

      expect(body.title).toBe('Login failed.');
      expect(body.status).toBe(401);
      expect(body.detail).toBe('Invalid email or password.');
    }
  );
  test('should reject login with invalid email', { tag: ['@regression'] }, async ({ request }) => {
    const password = process.env.TEST_PASSWORD;

    expect(password).toBeTruthy();

    const identityClient = new IdentityApiClient(request);

    const { response, body } = await identityClient.login({
      email: 'nonexistent-user@texasmediadart-test.com',
      password: password!
    });

    expect(response.status()).toBe(401);
    expect(isLoginErrorResponse(body)).toBe(true);

    if (!isLoginErrorResponse(body)) {
      throw new Error('Expected login error response.');
    }

    expect(body.title).toBe('Login failed.');
    expect(body.status).toBe(401);
    expect(body.detail).toBe('Invalid email or password.');
  });
});
