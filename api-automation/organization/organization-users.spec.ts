import { test, expect } from '../fixtures/auth.fixture';

test.describe('Organization API - Users', () => {
  test(
    'should return organization users for authorized user',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUsers(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      expect(Array.isArray(result.body.items)).toBe(true);
      expect(result.body.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.body.pageNumber).toBe(1);
      expect(result.body.pageSize).toBe(25);
    }
  );

  test(
    'should return organization user data structure',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUsers(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);
      expect(result.body.items.length).toBeGreaterThan(0);

      const user = result.body.items[0];

      expect(user.organizationUserId).toBeGreaterThan(0);
      expect(user.organizationId).toBeTruthy();
      expect(user.identityUserId).toBeTruthy();

      expect(typeof user.isActive).toBe('boolean');
      expect(typeof user.isApproved).toBe('boolean');

      expect(user.createdBy).toBeTruthy();
      expect(user.createdUtc).toBeTruthy();
    }
  );

  test(
    'should filter by authenticated identity user id',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUsers(authenticatedUser.accessToken, {
        identityUserId: authenticatedUser.userId
      });

      expect(result.response.status()).toBe(200);
      expect(result.body.items.length).toBeGreaterThan(0);

      for (const user of result.body.items) {
        expect(user.identityUserId).toBe(authenticatedUser.userId);
      }
    }
  );

  test(
    'should filter active users',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUsers(authenticatedUser.accessToken, {
        isActive: true
      });

      expect(result.response.status()).toBe(200);

      for (const user of result.body.items) {
        expect(user.isActive).toBe(true);
      }
    }
  );

  test(
    'should filter approved users',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUsers(authenticatedUser.accessToken, {
        isApproved: true
      });

      expect(result.response.status()).toBe(200);

      for (const user of result.body.items) {
        expect(user.isApproved).toBe(true);
      }
    }
  );

  test(
    'should support pagination',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUsers(authenticatedUser.accessToken, {
        pageNumber: 1,
        pageSize: 1
      });

      expect(result.response.status()).toBe(200);

      expect(result.body.pageNumber).toBe(1);
      expect(result.body.pageSize).toBe(1);
      expect(result.body.items.length).toBeLessThanOrEqual(1);
    }
  );

  test(
    'should return 401 without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.searchUsersWithoutToken();

      expect(response.status()).toBe(401);
    }
  );
});
