import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';

test.describe('Identity API - Login', () => {

  test('should login successfully with valid credentials', async ({ request }) => {

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

    expect(body.userId).toBeTruthy();
    expect(body.email).toBe(email);
    expect(body.accessToken).toBeTruthy();
    expect(body.expiresAtUtc).toBeTruthy();
    expect(body.refreshToken).toBeTruthy();
    expect(body.refreshTokenExpiresAtUtc).toBeTruthy();
  });

});