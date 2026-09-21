import { test, expect } from '../fixtures/auth.fixture';

test.describe('Main API - Users Composition', () => {
  test(
    'should return users for authenticated user',
    { tag: ['@smoke', '@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      expect(Array.isArray(result.body.items)).toBeTruthy();

      expect(result.body.totalCount).toBeGreaterThanOrEqual(0);

      expect(result.body.pageNumber).toBe(1);

      expect(result.body.pageSize).toBe(25);
    }
  );

  test(
    'should return composed user data',
    { tag: ['@smoke', '@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      expect(result.body.items.length).toBeGreaterThan(0);

      const user = result.body.items[0];

      expect(user.organizationUserId).toBeGreaterThan(0);

      expect(user.organizationId).toBeTruthy();

      expect(user.identityUserId).toBeTruthy();

      expect(user.email).toBeTruthy();

      expect(typeof user.isActive).toBe('boolean');

      expect(typeof user.isApproved).toBe('boolean');

      expect(typeof user.identityIsActive).toBe('boolean');

      expect(typeof user.isEmailVerified).toBe('boolean');
    }
  );

  test(
    'should filter users by current identity user id',
    { tag: ['@smoke', '@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
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
    'should support pagination',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
        pageNumber: 1,
        pageSize: 1
      });

      expect(result.response.status()).toBe(200);

      expect(result.body.pageNumber).toBe(1);

      expect(result.body.pageSize).toBe(1);

      expect(result.body.items.length).toBeLessThanOrEqual(1);

      expect(result.body.totalCount).toBeGreaterThanOrEqual(result.body.items.length);
    }
  );

  test(
    'should return unauthorized without access token',
    { tag: ['@smoke', '@regression'] },
    async ({ usersClient }) => {
      const response = await usersClient.searchUsersWithoutAuthentication();

      expect(response.status()).toBe(401);
    }
  );

  test(
    'should return unauthorized with invalid access token',
    { tag: ['@regression'] },
    async ({ usersClient }) => {
      const response = await usersClient.searchUsersWithInvalidToken();

      expect(response.status()).toBe(401);
    }
  );
  test(
    'should filter users by active status',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
        isActive: true
      });

      expect(result.response.status()).toBe(200);

      for (const user of result.body.items) {
        expect(user.isActive).toBe(true);
      }
    }
  );

  test(
    'should filter users by inactive status',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
        isActive: false
      });

      expect(result.response.status()).toBe(200);

      for (const user of result.body.items) {
        expect(user.isActive).toBe(false);
      }
    }
  );

  test(
    'should filter users by approved status',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
        isApproved: true
      });

      expect(result.response.status()).toBe(200);

      for (const user of result.body.items) {
        expect(user.isApproved).toBe(true);
      }
    }
  );

  test(
    'should filter users by unapproved status',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
        isApproved: false
      });

      expect(result.response.status()).toBe(200);

      for (const user of result.body.items) {
        expect(user.isApproved).toBe(false);
      }
    }
  );

  test(
    'should return empty result for unknown identity user id',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const unknownIdentityUserId = '00000000-0000-0000-0000-000000000001';

      const result = await usersClient.searchUsers(authenticatedUser.accessToken, {
        identityUserId: unknownIdentityUserId
      });

      expect(result.response.status()).toBe(200);

      expect(result.body.items).toEqual([]);

      expect(result.body.totalCount).toBe(0);

      expect(result.body.pageNumber).toBe(1);

      expect(result.body.pageSize).toBe(25);
    }
  );

  test(
    'should return consistent pagination metadata',
    { tag: ['@regression'] },
    async ({ usersClient, authenticatedUser }) => {
      const pageSize = 1;

      const firstPage = await usersClient.searchUsers(authenticatedUser.accessToken, {
        pageNumber: 1,
        pageSize
      });

      expect(firstPage.response.status()).toBe(200);

      expect(firstPage.body.pageNumber).toBe(1);
      expect(firstPage.body.pageSize).toBe(pageSize);

      expect(firstPage.body.items.length).toBeLessThanOrEqual(pageSize);

      expect(firstPage.body.totalCount).toBeGreaterThanOrEqual(firstPage.body.items.length);

      if (firstPage.body.totalCount > pageSize) {
        const secondPage = await usersClient.searchUsers(authenticatedUser.accessToken, {
          pageNumber: 2,
          pageSize
        });

        expect(secondPage.response.status()).toBe(200);

        expect(secondPage.body.pageNumber).toBe(2);
        expect(secondPage.body.pageSize).toBe(pageSize);

        expect(secondPage.body.items.length).toBeLessThanOrEqual(pageSize);
      }
    }
  );
});
