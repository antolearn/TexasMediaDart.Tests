import { test, expect } from '@playwright/test';
import { IdentityApiClient } from '../clients/identity.client';
import { generateUniqueEmail } from '../utils/test-data';
import { isLoginResponse } from '../models/login.models';
import {
  isRegisterResponse,
  isRegisterErrorResponse,
  isRegisterValidationErrorResponse
} from '../models/register.models';

test.describe('Identity API - Registration', () => {
  test(
    'should register a new user and login successfully',
    { tag: ['@regression', '@data-creation', '@dev-only'] },
    async ({ request }) => {
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
      expect(isRegisterResponse(registerResult.body)).toBe(true);

      if (!isRegisterResponse(registerResult.body)) {
        throw new Error('Expected successful registration response.');
      }

      expect(registerResult.body.userId).toBeTruthy();
      expect(registerResult.body.email).toBe(email);

      // Step 2: Login using newly registered user
      const loginResult = await identityClient.login({
        email,
        password
      });

      expect(loginResult.response.status()).toBe(200);

      if (!isLoginResponse(loginResult.body)) {
        throw new Error('Expected successful login after registration.');
      }

      expect(loginResult.body.userId).toBe(registerResult.body.userId);

      expect(loginResult.body.email).toBe(email);

      expect(loginResult.body.accessToken).toBeTruthy();

      // Step 3: Verify authenticated user
      const meResult = await identityClient.getMe(loginResult.body.accessToken);

      expect(meResult.response.status()).toBe(200);

      expect(meResult.body.userId).toBe(registerResult.body.userId);

      expect(meResult.body.email).toBe(email);
    }
  );
  test(
    'should reject registration with duplicate email',
    { tag: ['@regression', '@dev-only'] },
    async ({ request }) => {
      const email = process.env.TEST_EMAIL;
      const password = process.env.TEST_PASSWORD;

      expect(email).toBeTruthy();
      expect(password).toBeTruthy();

      const identityClient = new IdentityApiClient(request);

      const registerResult = await identityClient.register({
        email: email!,
        password: password!,
        confirmPassword: password!
      });

      expect(registerResult.response.status()).toBe(409);

      expect(isRegisterErrorResponse(registerResult.body)).toBe(true);

      if (!isRegisterErrorResponse(registerResult.body)) {
        throw new Error('Expected duplicate registration error response.');
      }

      expect(registerResult.body.title).toBe('Registration failed.');

      expect(registerResult.body.status).toBe(409);

      expect(registerResult.body.detail).toBe('A user with this email already exists.');
    }
  );
  test(
    'should reject registration when passwords do not match',
    { tag: ['@regression', '@dev-only'] },
    async ({ request }) => {
      const identityClient = new IdentityApiClient(request);

      const registerResult = await identityClient.register({
        email: `mismatch${Date.now()}@example.com`,
        password: 'Test@123456',
        confirmPassword: 'Different@123456'
      });

      expect(registerResult.response.status()).toBe(400);

      expect(isRegisterValidationErrorResponse(registerResult.body)).toBe(true);

      if (!isRegisterValidationErrorResponse(registerResult.body)) {
        throw new Error('Expected registration validation error response.');
      }

      expect(registerResult.body.title).toBe('Registration validation failed.');

      expect(registerResult.body.status).toBe(400);

      expect(registerResult.body.errors.ConfirmPassword).toContain(
        'Password and confirm password must match.'
      );
    }
  );
  test(
    'should reject registration with invalid email format',
    { tag: ['@regression', '@dev-only'] },
    async ({ request }) => {
      const identityClient = new IdentityApiClient(request);

      const registerResult = await identityClient.register({
        email: 'invalid-email',
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

      expect(registerResult.response.status()).toBe(400);

      expect(isRegisterValidationErrorResponse(registerResult.body)).toBe(true);

      if (!isRegisterValidationErrorResponse(registerResult.body)) {
        throw new Error('Expected registration validation error response.');
      }

      expect(registerResult.body.title).toBe('Registration validation failed.');

      expect(registerResult.body.status).toBe(400);

      expect(registerResult.body.errors.Email).toContain('A valid email address is required.');
    }
  );
});
