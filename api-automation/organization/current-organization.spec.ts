import { test, expect } from '../fixtures/auth.fixture';

test.describe('Organization API - Current Organization', () => {
  // These tests share the same organization record.
  // Run serially to prevent update/restore operations from interfering
  // with other tests that read the organization at the same time.
  test.describe.configure({ mode: 'serial' });
  test(
    'should return 400 when creating organization with empty name',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const response = await organizationClient.createOrganizationResponse(
        authenticatedUser.accessToken,
        ''
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.message).toBe('Organization name is required.');
    }
  );
  test(
    'should return 401 when creating organization without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.createOrganizationWithoutToken(
        'Unauthorized Organization'
      );

      expect(response.status()).toBe(401);
    }
  );
  test(
    'should return 409 when authenticated user already belongs to an organization',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const currentResult = await organizationClient.getCurrentOrganization(
        authenticatedUser.accessToken
      );

      expect(currentResult.response.status()).toBe(200);

      const originalOrganization = currentResult.body;

      const response = await organizationClient.createOrganizationResponse(
        authenticatedUser.accessToken,
        `Duplicate Organization ${Date.now()}`
      );

      expect(response.status()).toBe(409);

      const body = await response.json();

      expect(body.status).toBe(409);
      expect(body.title).toBe('Conflict');
      expect(body.detail).toBe('The authenticated user already belongs to an organization.');
      expect(body.instance).toBe('/api/organizations');

      // Verify the failed create did not change the user's current organization.
      const persistedResult = await organizationClient.getCurrentOrganization(
        authenticatedUser.accessToken
      );

      expect(persistedResult.response.status()).toBe(200);
      expect(persistedResult.body.organizationId).toBe(originalOrganization.organizationId);
      expect(persistedResult.body.name).toBe(originalOrganization.name);
    }
  );
  test(
    'should return current organization for authenticated user',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentOrganization(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      expect(result.body.organizationId).toBeTruthy();
      expect(result.body.organizationUserId).toBeGreaterThan(0);

      expect(result.body.identityUserId).toBe(authenticatedUser.userId);

      expect(result.body.name).toBeTruthy();

      expect(typeof result.body.isActive).toBe('boolean');
      expect(typeof result.body.userIsActive).toBe('boolean');
      expect(typeof result.body.userIsApproved).toBe('boolean');

      expect(result.body.createdBy).toBeTruthy();
      expect(result.body.createdUtc).toBeTruthy();
    }
  );

  test(
    'should update and persist current organization',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const originalResult = await organizationClient.getCurrentOrganization(
        authenticatedUser.accessToken
      );

      expect(originalResult.response.status()).toBe(200);

      const originalOrganization = originalResult.body;
      const updatedName = `${originalOrganization.name} Automation ${Date.now()}`;

      try {
        const updateResult = await organizationClient.updateCurrentOrganization(
          authenticatedUser.accessToken,
          {
            name: updatedName,
            isActive: originalOrganization.isActive
          }
        );

        expect(updateResult.response.status()).toBe(200);

        expect(updateResult.body.organizationId).toBe(originalOrganization.organizationId);
        expect(updateResult.body.name).toBe(updatedName);
        expect(updateResult.body.isActive).toBe(originalOrganization.isActive);

        const persistedResult = await organizationClient.getCurrentOrganization(
          authenticatedUser.accessToken
        );

        expect(persistedResult.response.status()).toBe(200);
        expect(persistedResult.body.organizationId).toBe(originalOrganization.organizationId);
        expect(persistedResult.body.name).toBe(updatedName);
        expect(persistedResult.body.isActive).toBe(originalOrganization.isActive);
      } finally {
        const restoreResult = await organizationClient.updateCurrentOrganization(
          authenticatedUser.accessToken,
          {
            name: originalOrganization.name,
            isActive: originalOrganization.isActive
          }
        );

        expect(restoreResult.response.status()).toBe(200);
        expect(restoreResult.body.name).toBe(originalOrganization.name);
        expect(restoreResult.body.isActive).toBe(originalOrganization.isActive);
      }
    }
  );

  test(
    'should return 400 when organization name is empty',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const currentResult = await organizationClient.getCurrentOrganization(
        authenticatedUser.accessToken
      );

      expect(currentResult.response.status()).toBe(200);

      const response = await organizationClient.updateCurrentOrganizationResponse(
        authenticatedUser.accessToken,
        {
          name: '',
          isActive: currentResult.body.isActive
        }
      );

      expect(response.status()).toBe(400);

      const body = await response.json();

      expect(body.message).toBe('Organization name is required.');

      // Verify the rejected request did not modify the organization.
      const persistedResult = await organizationClient.getCurrentOrganization(
        authenticatedUser.accessToken
      );

      expect(persistedResult.response.status()).toBe(200);
      expect(persistedResult.body.name).toBe(currentResult.body.name);
      expect(persistedResult.body.isActive).toBe(currentResult.body.isActive);
    }
  );

  test(
    'should return 401 when updating organization without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.updateCurrentOrganizationWithoutToken({
        name: 'Unauthorized Organization Update',
        isActive: true
      });

      expect(response.status()).toBe(401);
    }
  );

  test(
    'should return 401 without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.getCurrentOrganizationWithoutToken();

      expect(response.status()).toBe(401);
    }
  );
});
