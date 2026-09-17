import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';
import { generateUniqueEmail } from '../utils/test-data';
import { isLoginResponse } from '../models/login.models';

test.describe('Identity API - Registration', () => {

  test('should register a new user and login successfully', async ({ request }) => {

    const identityClient = new IdentityApiClient(request);

    const email = generateUniqueEmail();
    const password = 'Test@123456';

    // Step 1: Register new user
    const registerResult = await identityClient.register({
      email,
      password,
      confirmPassword: password
    });

    expect(registerResult.response.status()).toBe(201);

    expect(registerResult.body.userId).toBeTruthy();
    expect(registerResult.body.email).toBe(email);

    // Step 2: Login using newly registered user
    const loginResult = await identityClient.login({
      email,
      password
    });

    expect(loginResult.response.status()).toBe(200);

    if (!isLoginResponse(loginResult.body)) {
      throw new Error(
        'Expected successful login after registration.'
      );
    }

    expect(loginResult.body.userId)
      .toBe(registerResult.body.userId);

    expect(loginResult.body.email)
      .toBe(email);

    expect(loginResult.body.accessToken)
      .toBeTruthy();

    // Step 3: Verify authenticated user
    const meResult = await identityClient.getMe(
      loginResult.body.accessToken
    );

    expect(meResult.response.status()).toBe(200);

    expect(meResult.body.userId)
      .toBe(registerResult.body.userId);

    expect(meResult.body.email)
      .toBe(email);
  });

});