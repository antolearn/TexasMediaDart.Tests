import { test, expect } from '../fixtures/auth.fixture';

test.describe('Organization API - Current User Modules', () => {
  test(
    'should return modules for authenticated user',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentModules(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body.length).toBeGreaterThan(0);
    }
  );

  test(
    'should return USERS module with permission structure',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentModules(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      const usersModule = result.body.find((module) => module.moduleCode.toUpperCase() === 'USERS');

      expect(usersModule).toBeDefined();

      expect(usersModule!.organizationId).toBeTruthy();
      expect(usersModule!.organizationUserId).toBeGreaterThan(0);
      expect(usersModule!.moduleId).toBeGreaterThan(0);
      expect(usersModule!.moduleName).toBeTruthy();

      expect(typeof usersModule!.canRead).toBe('boolean');
      expect(typeof usersModule!.canCreate).toBe('boolean');
      expect(typeof usersModule!.canUpdate).toBe('boolean');
      expect(typeof usersModule!.canDelete).toBe('boolean');
    }
  );

  test(
    'should return 401 without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.getCurrentModulesWithoutToken();

      expect(response.status()).toBe(401);
    }
  );
});
