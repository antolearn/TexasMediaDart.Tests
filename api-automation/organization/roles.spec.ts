import { test, expect } from '../fixtures/auth.fixture';

test.describe('Organization API - Roles', () => {
  test(
    'should return roles for authenticated user',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchRoles(authenticatedUser.accessToken);

      expect(result.response.status()).toBe(200);

      expect(Array.isArray(result.body.items)).toBe(true);
      expect(result.body.items.length).toBeGreaterThan(0);
      expect(result.body.totalCount).toBeGreaterThan(0);
      expect(result.body.pageNumber).toBe(1);
      expect(result.body.pageSize).toBeGreaterThan(0);

      const ownerRole = result.body.items.find((role) => role.name.toUpperCase() === 'OWNER');

      expect(ownerRole).toBeDefined();
      expect(ownerRole!.roleId).toBeTruthy();
      expect(ownerRole!.organizationId).toBeTruthy();
      expect(ownerRole!.isSystemRole).toBe(true);
      expect(ownerRole!.isActive).toBe(true);
      expect(ownerRole!.isDeleted).toBe(false);
    }
  );
  test(
    'should sort roles by createdUtc descending',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchRoles(authenticatedUser.accessToken, {
        sortBy: 'createdUtc',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 100
      });

      expect(result.response.status()).toBe(200);
      expect(result.body.items.length).toBeGreaterThan(1);

      const createdDates = result.body.items.map((role) => new Date(role.createdUtc).getTime());

      for (let index = 1; index < createdDates.length; index++) {
        expect(createdDates[index - 1]).toBeGreaterThanOrEqual(createdDates[index]);
      }
    }
  );
  test(
    'should preserve createdUtc sorting across paginated role results',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const firstPage = await organizationClient.searchRoles(authenticatedUser.accessToken, {
        sortBy: 'createdUtc',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 3
      });

      expect(firstPage.response.status()).toBe(200);
      expect(firstPage.body.pageNumber).toBe(1);
      expect(firstPage.body.pageSize).toBe(3);
      expect(firstPage.body.items.length).toBeGreaterThan(0);

      const secondPage = await organizationClient.searchRoles(authenticatedUser.accessToken, {
        sortBy: 'createdUtc',
        sortDirection: 'desc',
        pageNumber: 2,
        pageSize: 3
      });

      expect(secondPage.response.status()).toBe(200);
      expect(secondPage.body.pageNumber).toBe(2);
      expect(secondPage.body.pageSize).toBe(3);

      if (secondPage.body.items.length > 0) {
        const lastRoleOnFirstPage = firstPage.body.items[firstPage.body.items.length - 1];

        const firstRoleOnSecondPage = secondPage.body.items[0];

        expect(new Date(lastRoleOnFirstPage.createdUtc).getTime()).toBeGreaterThanOrEqual(
          new Date(firstRoleOnSecondPage.createdUtc).getTime()
        );
      }
    }
  );
  test(
    'should sort roles by name ascending and descending',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const ascendingResult = await organizationClient.searchRoles(authenticatedUser.accessToken, {
        sortBy: 'name',
        sortDirection: 'asc',
        pageNumber: 1,
        pageSize: 100
      });

      expect(ascendingResult.response.status()).toBe(200);
      expect(ascendingResult.body.items.length).toBeGreaterThan(1);

      const descendingResult = await organizationClient.searchRoles(authenticatedUser.accessToken, {
        sortBy: 'name',
        sortDirection: 'desc',
        pageNumber: 1,
        pageSize: 100
      });

      expect(descendingResult.response.status()).toBe(200);
      expect(descendingResult.body.items.length).toBeGreaterThan(1);

      const ascendingNames = ascendingResult.body.items.map((role) => role.name);

      const descendingNames = descendingResult.body.items.map((role) => role.name);

      expect(descendingNames).toEqual([...ascendingNames].reverse());
    }
  );
  test(
    'should return 400 for invalid role sorting parameters',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const invalidSortByResponse = await organizationClient.searchRolesWithRawParameters(
        authenticatedUser.accessToken,
        {
          sortBy: 'invalidField',
          sortDirection: 'asc'
        }
      );

      expect(invalidSortByResponse.status()).toBe(400);

      const invalidSortByBody = await invalidSortByResponse.json();

      expect(invalidSortByBody.status).toBe(400);
      expect(invalidSortByBody.detail).toContain(
        'SortBy must be name, description, or createdUtc.'
      );

      const missingSortByResponse = await organizationClient.searchRolesWithRawParameters(
        authenticatedUser.accessToken,
        {
          sortDirection: 'desc'
        }
      );

      expect(missingSortByResponse.status()).toBe(400);

      const missingSortByBody = await missingSortByResponse.json();

      expect(missingSortByBody.status).toBe(400);
      expect(missingSortByBody.detail).toContain(
        'SortBy is required when SortDirection is provided.'
      );
    }
  );

  test(
    'should return 401 without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.searchRolesWithoutToken();

      expect(response.status()).toBe(401);
    }
  );

  test(
    'should create, retrieve, update, verify, and delete a role',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const roleName = `Automation QA Role ${Date.now()}`;
      const description = 'Created by Playwright API automation.';

      // Create role
      const createResult = await organizationClient.createRole(authenticatedUser.accessToken, {
        name: roleName,
        description
      });

      expect(createResult.response.status()).toBe(201);

      expect(createResult.body.roleId).toBeTruthy();
      expect(createResult.body.organizationId).toBeTruthy();
      expect(createResult.body.name).toBe(roleName);
      expect(createResult.body.description).toBe(description);

      expect(createResult.body.isSystemRole).toBe(false);
      expect(createResult.body.isActive).toBe(true);
      expect(createResult.body.isDeleted).toBe(false);
      expect(createResult.body.isApproved).toBe(false);

      expect(createResult.body.createdBy).toBeTruthy();
      expect(createResult.body.createdUtc).toBeTruthy();
      expect(createResult.body.modifiedBy).toBeNull();
      expect(createResult.body.modifiedUtc).toBeNull();

      const roleId = createResult.body.roleId;
      const organizationId = createResult.body.organizationId;

      // Get role by ID
      const getResult = await organizationClient.getRoleById(authenticatedUser.accessToken, roleId);

      expect(getResult.response.status()).toBe(200);

      expect(getResult.body.roleId).toBe(roleId);
      expect(getResult.body.organizationId).toBe(organizationId);
      expect(getResult.body.name).toBe(roleName);
      expect(getResult.body.description).toBe(description);

      expect(getResult.body.isSystemRole).toBe(false);
      expect(getResult.body.isActive).toBe(true);
      expect(getResult.body.isDeleted).toBe(false);
      expect(getResult.body.isApproved).toBe(false);

      expect(getResult.body.createdBy).toBeTruthy();
      expect(getResult.body.createdUtc).toBeTruthy();

      // Update role
      const updatedRoleName = `${roleName} Updated`;
      const updatedDescription = 'Updated by Playwright API automation.';

      const updateResult = await organizationClient.updateRole(
        authenticatedUser.accessToken,
        roleId,
        {
          name: updatedRoleName,
          description: updatedDescription,
          isActive: true
        }
      );

      expect(updateResult.response.status()).toBe(200);

      expect(updateResult.body.roleId).toBe(roleId);
      expect(updateResult.body.organizationId).toBe(organizationId);
      expect(updateResult.body.name).toBe(updatedRoleName);
      expect(updateResult.body.description).toBe(updatedDescription);

      expect(updateResult.body.isSystemRole).toBe(false);
      expect(updateResult.body.isActive).toBe(true);
      expect(updateResult.body.isDeleted).toBe(false);
      expect(updateResult.body.isApproved).toBe(false);

      // Creation audit information should be preserved
      expect(updateResult.body.createdBy).toBe(createResult.body.createdBy);
      expect(updateResult.body.createdUtc).toBe(createResult.body.createdUtc);

      // Modification audit information should now be populated
      expect(updateResult.body.modifiedBy).toBeTruthy();
      expect(updateResult.body.modifiedUtc).toBeTruthy();

      // Get role again and verify update was persisted
      const getUpdatedResult = await organizationClient.getRoleById(
        authenticatedUser.accessToken,
        roleId
      );

      expect(getUpdatedResult.response.status()).toBe(200);

      expect(getUpdatedResult.body.roleId).toBe(roleId);
      expect(getUpdatedResult.body.organizationId).toBe(organizationId);
      expect(getUpdatedResult.body.name).toBe(updatedRoleName);
      expect(getUpdatedResult.body.description).toBe(updatedDescription);

      expect(getUpdatedResult.body.isSystemRole).toBe(false);
      expect(getUpdatedResult.body.isActive).toBe(true);
      expect(getUpdatedResult.body.isDeleted).toBe(false);
      expect(getUpdatedResult.body.isApproved).toBe(false);

      expect(getUpdatedResult.body.modifiedBy).toBeTruthy();
      expect(getUpdatedResult.body.modifiedUtc).toBeTruthy();

      // Delete role
      const deleteResult = await organizationClient.deleteRole(
        authenticatedUser.accessToken,
        roleId
      );

      expect(deleteResult.response.status()).toBe(200);

      expect(deleteResult.body.roleId).toBe(roleId);
      expect(deleteResult.body.organizationId).toBe(organizationId);
      expect(deleteResult.body.name).toBe(updatedRoleName);

      expect(deleteResult.body.isSystemRole).toBe(false);
      expect(deleteResult.body.isActive).toBe(false);
      expect(deleteResult.body.isDeleted).toBe(true);

      expect(deleteResult.body.modifiedBy).toBeTruthy();
      expect(deleteResult.body.modifiedUtc).toBeTruthy();

      // Verify deleted role is excluded from the default search
      const defaultSearchResult = await organizationClient.searchRoles(
        authenticatedUser.accessToken,
        {
          search: updatedRoleName
        }
      );

      expect(defaultSearchResult.response.status()).toBe(200);

      const roleInDefaultSearch = defaultSearchResult.body.items.find(
        (role) => role.roleId === roleId
      );

      expect(roleInDefaultSearch).toBeUndefined();

      // Verify deleted role is returned when includeDeleted is enabled
      const includeDeletedSearchResult = await organizationClient.searchRoles(
        authenticatedUser.accessToken,
        {
          search: updatedRoleName,
          includeDeleted: true
        }
      );

      expect(includeDeletedSearchResult.response.status()).toBe(200);

      const deletedRole = includeDeletedSearchResult.body.items.find(
        (role) => role.roleId === roleId
      );

      expect(deletedRole).toBeDefined();
      expect(deletedRole!.roleId).toBe(roleId);
      expect(deletedRole!.organizationId).toBe(organizationId);
      expect(deletedRole!.name).toBe(updatedRoleName);
      expect(deletedRole!.isSystemRole).toBe(false);
      expect(deletedRole!.isActive).toBe(false);
      expect(deletedRole!.isDeleted).toBe(true);

      // Verify deleted role is still unavailable through GET by ID
      const getDeletedResponse = await organizationClient.getRoleByIdResponse(
        authenticatedUser.accessToken,
        roleId
      );

      expect(getDeletedResponse.status()).toBe(404);
    }
  );

  test(
    'should update and persist permissions for a role',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const roleName = `Automation Permissions Role ${Date.now()}`;

      // Create temporary role
      const createResult = await organizationClient.createRole(authenticatedUser.accessToken, {
        name: roleName,
        description: 'Temporary role for permissions API automation.'
      });

      expect(createResult.response.status()).toBe(201);

      const roleId = createResult.body.roleId;

      // Get initial role permissions
      const initialPermissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(initialPermissionsResult.response.status()).toBe(200);
      expect(Array.isArray(initialPermissionsResult.body)).toBe(true);
      expect(initialPermissionsResult.body.length).toBeGreaterThan(0);

      // Find modules dynamically by moduleCode.
      // Do not hardcode module IDs.
      const contactPermission = initialPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const dashboardPermission = initialPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const usersPermission = initialPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(contactPermission).toBeDefined();
      expect(dashboardPermission).toBeDefined();
      expect(usersPermission).toBeDefined();

      // Newly created role should initially have no permissions
      expect(contactPermission!.canCreate).toBe(false);
      expect(contactPermission!.canRead).toBe(false);
      expect(contactPermission!.canUpdate).toBe(false);
      expect(contactPermission!.canDelete).toBe(false);
      expect(contactPermission!.canApprove).toBe(false);

      expect(dashboardPermission!.canCreate).toBe(false);
      expect(dashboardPermission!.canRead).toBe(false);
      expect(dashboardPermission!.canUpdate).toBe(false);
      expect(dashboardPermission!.canDelete).toBe(false);
      expect(dashboardPermission!.canApprove).toBe(false);

      expect(usersPermission!.canCreate).toBe(false);
      expect(usersPermission!.canRead).toBe(false);
      expect(usersPermission!.canUpdate).toBe(false);
      expect(usersPermission!.canDelete).toBe(false);
      expect(usersPermission!.canApprove).toBe(false);

      // Update role permissions
      const updatePermissionsResult = await organizationClient.updateRolePermissions(
        authenticatedUser.accessToken,
        roleId,
        {
          permissions: [
            {
              moduleId: contactPermission!.moduleId,
              canCreate: true,
              canUpdate: true,
              canDelete: false,
              canRead: true,
              canApprove: false
            },
            {
              moduleId: dashboardPermission!.moduleId,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canRead: true,
              canApprove: false
            },
            {
              moduleId: usersPermission!.moduleId,
              canCreate: false,
              canUpdate: true,
              canDelete: false,
              canRead: true,
              canApprove: false
            }
          ]
        }
      );

      expect(updatePermissionsResult.response.status()).toBe(200);

      // PUT should return the complete entitled module matrix
      expect(Array.isArray(updatePermissionsResult.body)).toBe(true);
      expect(updatePermissionsResult.body.length).toBe(initialPermissionsResult.body.length);

      const updatedContactPermission = updatePermissionsResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const updatedDashboardPermission = updatePermissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const updatedUsersPermission = updatePermissionsResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(updatedContactPermission).toBeDefined();
      expect(updatedDashboardPermission).toBeDefined();
      expect(updatedUsersPermission).toBeDefined();

      // Verify PUT response
      expect(updatedContactPermission!.canCreate).toBe(true);
      expect(updatedContactPermission!.canRead).toBe(true);
      expect(updatedContactPermission!.canUpdate).toBe(true);
      expect(updatedContactPermission!.canDelete).toBe(false);
      expect(updatedContactPermission!.canApprove).toBe(false);

      expect(updatedDashboardPermission!.canCreate).toBe(false);
      expect(updatedDashboardPermission!.canRead).toBe(true);
      expect(updatedDashboardPermission!.canUpdate).toBe(false);
      expect(updatedDashboardPermission!.canDelete).toBe(false);
      expect(updatedDashboardPermission!.canApprove).toBe(false);

      expect(updatedUsersPermission!.canCreate).toBe(false);
      expect(updatedUsersPermission!.canRead).toBe(true);
      expect(updatedUsersPermission!.canUpdate).toBe(true);
      expect(updatedUsersPermission!.canDelete).toBe(false);
      expect(updatedUsersPermission!.canApprove).toBe(false);

      // Get permissions again to verify persistence
      const persistedPermissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(persistedPermissionsResult.response.status()).toBe(200);

      const persistedContactPermission = persistedPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const persistedDashboardPermission = persistedPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const persistedUsersPermission = persistedPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(persistedContactPermission).toBeDefined();
      expect(persistedDashboardPermission).toBeDefined();
      expect(persistedUsersPermission).toBeDefined();

      // Verify CONTACT persisted
      expect(persistedContactPermission!.canCreate).toBe(true);
      expect(persistedContactPermission!.canRead).toBe(true);
      expect(persistedContactPermission!.canUpdate).toBe(true);
      expect(persistedContactPermission!.canDelete).toBe(false);
      expect(persistedContactPermission!.canApprove).toBe(false);

      // Verify DASHBOARD persisted
      expect(persistedDashboardPermission!.canCreate).toBe(false);
      expect(persistedDashboardPermission!.canRead).toBe(true);
      expect(persistedDashboardPermission!.canUpdate).toBe(false);
      expect(persistedDashboardPermission!.canDelete).toBe(false);
      expect(persistedDashboardPermission!.canApprove).toBe(false);

      // Verify USERS persisted
      expect(persistedUsersPermission!.canCreate).toBe(false);
      expect(persistedUsersPermission!.canRead).toBe(true);
      expect(persistedUsersPermission!.canUpdate).toBe(true);
      expect(persistedUsersPermission!.canDelete).toBe(false);
      expect(persistedUsersPermission!.canApprove).toBe(false);

      // Clean up temporary role
      const deleteResult = await organizationClient.deleteRole(
        authenticatedUser.accessToken,
        roleId
      );

      expect(deleteResult.response.status()).toBe(200);
      expect(deleteResult.body.isDeleted).toBe(true);
    }
  );

  test(
    'should replace existing permissions with desired permission state',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const roleName = `Automation Replace Permissions ${Date.now()}`;

      // Create temporary role
      const createResult = await organizationClient.createRole(authenticatedUser.accessToken, {
        name: roleName,
        description: 'Temporary role for permission replacement automation.'
      });

      expect(createResult.response.status()).toBe(201);

      const roleId = createResult.body.roleId;

      // Get available entitled modules
      const initialPermissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(initialPermissionsResult.response.status()).toBe(200);

      const contactPermission = initialPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const dashboardPermission = initialPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const usersPermission = initialPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(contactPermission).toBeDefined();
      expect(dashboardPermission).toBeDefined();
      expect(usersPermission).toBeDefined();

      // First PUT:
      // CONTACT   = Create + Read + Update
      // DASHBOARD = Read
      // USERS     = Read + Update
      const firstUpdateResult = await organizationClient.updateRolePermissions(
        authenticatedUser.accessToken,
        roleId,
        {
          permissions: [
            {
              moduleId: contactPermission!.moduleId,
              canCreate: true,
              canUpdate: true,
              canDelete: false,
              canRead: true,
              canApprove: false
            },
            {
              moduleId: dashboardPermission!.moduleId,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canRead: true,
              canApprove: false
            },
            {
              moduleId: usersPermission!.moduleId,
              canCreate: false,
              canUpdate: true,
              canDelete: false,
              canRead: true,
              canApprove: false
            }
          ]
        }
      );

      expect(firstUpdateResult.response.status()).toBe(200);

      // Verify first desired state was persisted
      const firstPersistedResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(firstPersistedResult.response.status()).toBe(200);

      const firstContact = firstPersistedResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const firstDashboard = firstPersistedResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const firstUsers = firstPersistedResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(firstContact).toBeDefined();
      expect(firstDashboard).toBeDefined();
      expect(firstUsers).toBeDefined();

      expect(firstContact!.canCreate).toBe(true);
      expect(firstContact!.canRead).toBe(true);
      expect(firstContact!.canUpdate).toBe(true);
      expect(firstContact!.canDelete).toBe(false);

      expect(firstDashboard!.canCreate).toBe(false);
      expect(firstDashboard!.canRead).toBe(true);
      expect(firstDashboard!.canUpdate).toBe(false);
      expect(firstDashboard!.canDelete).toBe(false);

      expect(firstUsers!.canCreate).toBe(false);
      expect(firstUsers!.canRead).toBe(true);
      expect(firstUsers!.canUpdate).toBe(true);
      expect(firstUsers!.canDelete).toBe(false);

      // Second PUT:
      // Send ONLY DASHBOARD.
      //
      // PUT represents the complete desired state, so CONTACT and USERS
      // should no longer have explicit role permissions.
      const replacementResult = await organizationClient.updateRolePermissions(
        authenticatedUser.accessToken,
        roleId,
        {
          permissions: [
            {
              moduleId: dashboardPermission!.moduleId,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canRead: true,
              canApprove: false
            }
          ]
        }
      );

      expect(replacementResult.response.status()).toBe(200);

      // PUT should still return the complete entitled module matrix
      expect(replacementResult.body.length).toBe(initialPermissionsResult.body.length);

      const replacementContact = replacementResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const replacementDashboard = replacementResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const replacementUsers = replacementResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(replacementContact).toBeDefined();
      expect(replacementDashboard).toBeDefined();
      expect(replacementUsers).toBeDefined();

      // CONTACT was omitted from the second PUT.
      // Its permissions should now be false.
      expect(replacementContact!.canCreate).toBe(false);
      expect(replacementContact!.canRead).toBe(false);
      expect(replacementContact!.canUpdate).toBe(false);
      expect(replacementContact!.canDelete).toBe(false);
      expect(replacementContact!.canApprove).toBe(false);

      // DASHBOARD was retained.
      expect(replacementDashboard!.canCreate).toBe(false);
      expect(replacementDashboard!.canRead).toBe(true);
      expect(replacementDashboard!.canUpdate).toBe(false);
      expect(replacementDashboard!.canDelete).toBe(false);
      expect(replacementDashboard!.canApprove).toBe(false);

      // USERS was omitted from the second PUT.
      // Its permissions should now be false.
      expect(replacementUsers!.canCreate).toBe(false);
      expect(replacementUsers!.canRead).toBe(false);
      expect(replacementUsers!.canUpdate).toBe(false);
      expect(replacementUsers!.canDelete).toBe(false);
      expect(replacementUsers!.canApprove).toBe(false);

      // Perform a fresh GET to prove replacement was persisted
      const finalPermissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(finalPermissionsResult.response.status()).toBe(200);

      const finalContact = finalPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'CONTACT'
      );

      const finalDashboard = finalPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      const finalUsers = finalPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'USERS'
      );

      expect(finalContact).toBeDefined();
      expect(finalDashboard).toBeDefined();
      expect(finalUsers).toBeDefined();

      // CONTACT remains cleared
      expect(finalContact!.canCreate).toBe(false);
      expect(finalContact!.canRead).toBe(false);
      expect(finalContact!.canUpdate).toBe(false);
      expect(finalContact!.canDelete).toBe(false);
      expect(finalContact!.canApprove).toBe(false);

      // DASHBOARD remains Read=true
      expect(finalDashboard!.canCreate).toBe(false);
      expect(finalDashboard!.canRead).toBe(true);
      expect(finalDashboard!.canUpdate).toBe(false);
      expect(finalDashboard!.canDelete).toBe(false);
      expect(finalDashboard!.canApprove).toBe(false);

      // USERS remains cleared
      expect(finalUsers!.canCreate).toBe(false);
      expect(finalUsers!.canRead).toBe(false);
      expect(finalUsers!.canUpdate).toBe(false);
      expect(finalUsers!.canDelete).toBe(false);
      expect(finalUsers!.canApprove).toBe(false);

      // Clean up temporary role
      const deleteResult = await organizationClient.deleteRole(
        authenticatedUser.accessToken,
        roleId
      );

      expect(deleteResult.response.status()).toBe(200);
      expect(deleteResult.body.isDeleted).toBe(true);
    }
  );

  test(
    'should return 400 when assigning unsupported module permission',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const roleName = `Automation Unsupported Permission ${Date.now()}`;

      // Create temporary role
      const createResult = await organizationClient.createRole(authenticatedUser.accessToken, {
        name: roleName,
        description: 'Temporary role for unsupported permission validation.'
      });

      expect(createResult.response.status()).toBe(201);

      const roleId = createResult.body.roleId;

      // Get available role permissions
      const permissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(permissionsResult.response.status()).toBe(200);

      // Find DASHBOARD dynamically
      const dashboardPermission = permissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      expect(dashboardPermission).toBeDefined();

      // Confirm our test assumption:
      // DASHBOARD does not support Create.
      expect(dashboardPermission!.supportsCreate).toBe(false);
      expect(dashboardPermission!.allowedCanCreate).toBe(false);

      // Attempt to assign unsupported Create permission
      const response = await organizationClient.updateRolePermissionsResponse(
        authenticatedUser.accessToken,
        roleId,
        {
          permissions: [
            {
              moduleId: dashboardPermission!.moduleId,
              canCreate: true,
              canUpdate: false,
              canDelete: false,
              canRead: true,
              canApprove: false
            }
          ]
        }
      );

      expect(response.status()).toBe(400);

      // Verify invalid permissions were not persisted
      const persistedPermissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        roleId
      );

      expect(persistedPermissionsResult.response.status()).toBe(200);

      const persistedDashboardPermission = persistedPermissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      expect(persistedDashboardPermission).toBeDefined();

      expect(persistedDashboardPermission!.canCreate).toBe(false);
      expect(persistedDashboardPermission!.canRead).toBe(false);
      expect(persistedDashboardPermission!.canUpdate).toBe(false);
      expect(persistedDashboardPermission!.canDelete).toBe(false);
      expect(persistedDashboardPermission!.canApprove).toBe(false);

      // Clean up temporary role
      const deleteResult = await organizationClient.deleteRole(
        authenticatedUser.accessToken,
        roleId
      );

      expect(deleteResult.response.status()).toBe(200);
      expect(deleteResult.body.isDeleted).toBe(true);
    }
  );

  test(
    'should return 404 for nonexistent role',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const nonexistentRoleId = '00000000-0000-0000-0000-000000000001';

      const response = await organizationClient.getRoleByIdResponse(
        authenticatedUser.accessToken,
        nonexistentRoleId
      );

      expect(response.status()).toBe(404);
    }
  );

  test(
    'should return 409 when updating a system role',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      // Get roles and dynamically find the OWNER system role
      const rolesResult = await organizationClient.searchRoles(authenticatedUser.accessToken);

      expect(rolesResult.response.status()).toBe(200);

      const ownerRole = rolesResult.body.items.find((role) => role.name.toUpperCase() === 'OWNER');

      expect(ownerRole).toBeDefined();
      expect(ownerRole!.isSystemRole).toBe(true);

      // Attempt to update the system role
      const response = await organizationClient.updateRoleResponse(
        authenticatedUser.accessToken,
        ownerRole!.roleId,
        {
          name: ownerRole!.name,
          description: ownerRole!.description,
          isActive: ownerRole!.isActive
        }
      );

      expect(response.status()).toBe(409);

      // Verify the system role was not modified
      const getResult = await organizationClient.getRoleById(
        authenticatedUser.accessToken,
        ownerRole!.roleId
      );

      expect(getResult.response.status()).toBe(200);
      expect(getResult.body.roleId).toBe(ownerRole!.roleId);
      expect(getResult.body.name).toBe(ownerRole!.name);
      expect(getResult.body.description).toBe(ownerRole!.description);
      expect(getResult.body.isActive).toBe(ownerRole!.isActive);
      expect(getResult.body.isSystemRole).toBe(true);
    }
  );

  test(
    'should return 404 when getting permissions for nonexistent role',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const nonexistentRoleId = '00000000-0000-0000-0000-000000000001';

      const response = await organizationClient.getRolePermissionsResponse(
        authenticatedUser.accessToken,
        nonexistentRoleId
      );

      expect(response.status()).toBe(404);
    }
  );

  test(
    'should return 409 when updating permissions for a system role',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      // Find the OWNER system role dynamically
      const rolesResult = await organizationClient.searchRoles(authenticatedUser.accessToken);

      expect(rolesResult.response.status()).toBe(200);

      const ownerRole = rolesResult.body.items.find((role) => role.name.toUpperCase() === 'OWNER');

      expect(ownerRole).toBeDefined();
      expect(ownerRole!.isSystemRole).toBe(true);

      // Get current OWNER permissions so we can use a valid module ID
      const permissionsResult = await organizationClient.getRolePermissions(
        authenticatedUser.accessToken,
        ownerRole!.roleId
      );

      expect(permissionsResult.response.status()).toBe(200);
      expect(permissionsResult.body.length).toBeGreaterThan(0);

      const dashboardPermission = permissionsResult.body.find(
        (permission) => permission.moduleCode === 'DASHBOARD'
      );

      expect(dashboardPermission).toBeDefined();

      // Attempt to modify permissions for the system role
      const response = await organizationClient.updateRolePermissionsResponse(
        authenticatedUser.accessToken,
        ownerRole!.roleId,
        {
          permissions: [
            {
              moduleId: dashboardPermission!.moduleId,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
              canRead: true,
              canApprove: false
            }
          ]
        }
      );

      expect(response.status()).toBe(409);
    }
  );
});
