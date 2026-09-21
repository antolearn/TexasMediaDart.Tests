import { test, expect } from "../fixtures/auth.fixture";

test.describe("Main API - Users Composition", () => {
  test(
    "should return users for authenticated user",
    { tag: ["@smoke", "@regression"] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(
        authenticatedUser.accessToken,
      );

      expect(result.response.status()).toBe(200);

      expect(Array.isArray(result.body.items)).toBeTruthy();

      expect(result.body.totalCount).toBeGreaterThanOrEqual(0);

      expect(result.body.pageNumber).toBe(1);

      expect(result.body.pageSize).toBe(25);
    },
  );

  test(
    "should return composed user data",
    { tag: ["@smoke", "@regression"] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(
        authenticatedUser.accessToken,
      );

      expect(result.response.status()).toBe(200);

      expect(result.body.items.length).toBeGreaterThan(0);

      const user = result.body.items[0];

      expect(user.organizationUserId).toBeGreaterThan(0);

      expect(user.organizationId).toBeTruthy();

      expect(user.identityUserId).toBeTruthy();

      expect(user.email).toBeTruthy();

      expect(typeof user.isActive).toBe("boolean");

      expect(typeof user.isApproved).toBe("boolean");

      expect(typeof user.identityIsActive).toBe("boolean");

      expect(typeof user.isEmailVerified).toBe("boolean");
    },
  );

  test(
    "should filter users by current identity user id",
    { tag: ["@smoke", "@regression"] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(
        authenticatedUser.accessToken,
        {
          identityUserId: authenticatedUser.userId,
        },
      );

      expect(result.response.status()).toBe(200);

      expect(result.body.items.length).toBeGreaterThan(0);

      for (const user of result.body.items) {
        expect(user.identityUserId).toBe(authenticatedUser.userId);
      }
    },
  );

  test(
    "should support pagination",
    { tag: ["@regression"] },
    async ({ usersClient, authenticatedUser }) => {
      const result = await usersClient.searchUsers(
        authenticatedUser.accessToken,
        {
          pageNumber: 1,
          pageSize: 1,
        },
      );

      expect(result.response.status()).toBe(200);

      expect(result.body.pageNumber).toBe(1);

      expect(result.body.pageSize).toBe(1);

      expect(result.body.items.length).toBeLessThanOrEqual(1);

      expect(result.body.totalCount).toBeGreaterThanOrEqual(
        result.body.items.length,
      );
    },
  );

  test(
    "should return unauthorized without access token",
    { tag: ["@smoke", "@regression"] },
    async ({ usersClient }) => {
      const response = await usersClient.searchUsersWithoutAuthentication();

      expect(response.status()).toBe(401);
    },
  );

  test(
    "should return unauthorized with invalid access token",
    { tag: ["@regression"] },
    async ({ usersClient }) => {
      const response = await usersClient.searchUsersWithInvalidToken();

      expect(response.status()).toBe(401);
    },
  );
});
