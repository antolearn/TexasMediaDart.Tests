import { test as base, expect } from '@playwright/test';

import { IdentityApiClient } from '../clients/identity.client';
import { isLoginResponse } from '../models/login.models';
import { AuthenticatedUser } from '../models/authenticated-user.models';
import { UsersApiClient } from '../clients/users.client';
import { OrganizationApiClient } from '../clients/organization.client';

type AuthFixtures = {
  identityClient: IdentityApiClient;
  usersClient: UsersApiClient;
  organizationClient: OrganizationApiClient;
  authenticatedUser: AuthenticatedUser;
};

export const test = base.extend<AuthFixtures>({
  identityClient: async ({ request }, use) => {
    const identityClient = new IdentityApiClient(request);

    await use(identityClient);
  },
  usersClient: async ({ request }, use) => {
    const usersClient = new UsersApiClient(request);

    await use(usersClient);
  },
  organizationClient: async ({ request }, use) => {
    const organizationClient = new OrganizationApiClient(request);

    await use(organizationClient);
  },

  authenticatedUser: async ({ identityClient }, use) => {
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;

    if (!email) {
      throw new Error('TEST_EMAIL is not configured.');
    }

    if (!password) {
      throw new Error('TEST_PASSWORD is not configured.');
    }

    const loginResult = await identityClient.login({
      email,
      password
    });

    expect(loginResult.response.status()).toBe(200);

    if (!isLoginResponse(loginResult.body)) {
      throw new Error('Expected successful login while creating authenticated fixture.');
    }

    const authenticatedUser: AuthenticatedUser = {
      userId: loginResult.body.userId,
      email: loginResult.body.email,
      accessToken: loginResult.body.accessToken,
      refreshToken: loginResult.body.refreshToken,
      expiresAtUtc: loginResult.body.expiresAtUtc,
      refreshTokenExpiresAtUtc: loginResult.body.refreshTokenExpiresAtUtc
    };

    await use(authenticatedUser);
  }
});

export { expect };
