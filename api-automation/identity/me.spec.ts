import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';

test.describe('Identity API - About Me', () => {

  test('should return current user with valid access token', async ({ request }) => {

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
    expect(loginResult.body.accessToken).toBeTruthy();

    // Step 2: Use access token
    const meResult = await identityClient.getMe(
      loginResult.body.accessToken
    );

    // Step 3: Validate response
    expect(meResult.response.status()).toBe(200);

    expect(meResult.body.userId).toBeTruthy();
    expect(meResult.body.email).toBe(email);
  });

});