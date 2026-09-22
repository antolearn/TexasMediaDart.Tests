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
    'should return valid module entitlement structure',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentModules(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);
      expect(result.body.length).toBeGreaterThan(0);

      for (const module of result.body) {
        // Module identity
        expect(module.organizationId).toBeTruthy();
        expect(module.organizationUserId).toBeGreaterThan(0);
        expect(module.moduleId).toBeGreaterThan(0);
        expect(module.moduleCode).toBeTruthy();
        expect(module.moduleName).toBeTruthy();

        // Menu metadata
        expect(typeof module.displayOrder).toBe('number');
        expect(typeof module.showInMenu).toBe('boolean');

        // Effective permissions
        expect(typeof module.canRead).toBe('boolean');
        expect(typeof module.canCreate).toBe('boolean');
        expect(typeof module.canUpdate).toBe('boolean');
        expect(typeof module.canDelete).toBe('boolean');
        
      }
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

      // Module identity
      expect(usersModule!.organizationId).toBeTruthy();
      expect(usersModule!.organizationUserId).toBeGreaterThan(0);
      expect(usersModule!.moduleId).toBeGreaterThan(0);
      expect(usersModule!.moduleCode).toBe('USERS');
      expect(usersModule!.moduleName).toBeTruthy();

      // Menu metadata
      expect(typeof usersModule!.displayOrder).toBe('number');
      expect(typeof usersModule!.showInMenu).toBe('boolean');

      // Effective permissions
      expect(typeof usersModule!.canRead).toBe('boolean');
      expect(typeof usersModule!.canCreate).toBe('boolean');
      expect(typeof usersModule!.canUpdate).toBe('boolean');
      expect(typeof usersModule!.canDelete).toBe('boolean');
      
    }
  );

  test(
    'should not return duplicate module codes',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentModules(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      const moduleCodes = result.body.map((module) => module.moduleCode.toUpperCase());

      const uniqueModuleCodes = new Set(moduleCodes);

      expect(uniqueModuleCodes.size).toBe(moduleCodes.length);
    }
  );

  test(
    'should return modules in display order',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentModules(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      const displayOrders = result.body.map((module) => module.displayOrder);

      const sortedDisplayOrders = [...displayOrders].sort((a, b) => a - b);

      expect(displayOrders).toEqual(sortedDisplayOrders);
    }
  );

  test(
    'should return valid menu metadata for menu modules',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.getCurrentModules(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      const menuModules = result.body.filter((module) => module.showInMenu);

      expect(menuModules.length).toBeGreaterThan(0);

      for (const module of menuModules) {
        expect(module.moduleCode).toBeTruthy();
        expect(module.moduleName).toBeTruthy();
        expect(module.route).toBeTruthy();
        expect(module.menuGroup).toBeTruthy();
        expect(module.displayOrder).toBeGreaterThanOrEqual(0);
      }
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
