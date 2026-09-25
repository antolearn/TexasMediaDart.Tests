import { test, expect } from '../fixtures/auth.fixture';

test.describe('Organization API - User Groups', () => {
  test(
    'should create a user group',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const uniqueName = `PW User Group ${Date.now()}`;

      const result = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: uniqueName,
        description: 'Created by Playwright API automation'
      });

      expect(result.response.status()).toBe(201);
      expect(result.body.userGroupId).toBeTruthy();
      expect(result.body.name).toBe(uniqueName);
    }
  );

  test(
    'should search user groups',
    { tag: ['@smoke', '@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const result = await organizationClient.searchUserGroups(authenticatedUser.accessToken, {
        pageNumber: 1,
        pageSize: 25
      });

      expect(result.response.status()).toBe(200);

      expect(Array.isArray(result.body.items)).toBe(true);
      expect(result.body.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.body.pageNumber).toBe(1);
      expect(result.body.pageSize).toBe(25);

      if (result.body.items.length > 0) {
        const group = result.body.items[0];

        expect(group.userGroupId).toBeTruthy();
        expect(group.organizationId).toBeTruthy();
        expect(group.name).toBeTruthy();

        expect(typeof group.isActive).toBe('boolean');
        expect(typeof group.isDeleted).toBe('boolean');
        expect(typeof group.isApproved).toBe('boolean');
      }
    }
  );

  test(
    'should return user group by id',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const uniqueName = `PW Get Group ${Date.now()}`;

      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: uniqueName,
        description: 'Created for get-by-id test'
      });

      expect(createResult.response.status()).toBe(201);

      const userGroupId = createResult.body.userGroupId;

      expect(userGroupId).toBeTruthy();

      const getResult = await organizationClient.getUserGroupById(
        authenticatedUser.accessToken,
        userGroupId
      );

      expect(getResult.response.status()).toBe(200);

      expect(getResult.body.userGroupId).toBe(userGroupId);
      expect(getResult.body.organizationId).toBe(createResult.body.organizationId);
      expect(getResult.body.name).toBe(uniqueName);
      expect(getResult.body.description).toBe('Created for get-by-id test');
      expect(getResult.body.isActive).toBe(true);
      expect(getResult.body.isDeleted).toBe(false);
    }
  );

  test(
    'should update a user group',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const originalName = `PW Update Group ${Date.now()}`;

      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: originalName,
        description: 'Original description'
      });

      expect(createResult.response.status()).toBe(201);

      const userGroupId = createResult.body.userGroupId;

      const updatedName = `${originalName} Updated`;
      const updatedDescription = 'Updated by Playwright API automation';

      const updateResult = await organizationClient.updateUserGroup(
        authenticatedUser.accessToken,
        userGroupId,
        {
          name: updatedName,
          description: updatedDescription,
          isActive: true
        }
      );

      expect(updateResult.response.status()).toBe(200);

      expect(updateResult.body.userGroupId).toBe(userGroupId);
      expect(updateResult.body.name).toBe(updatedName);
      expect(updateResult.body.description).toBe(updatedDescription);
      expect(updateResult.body.isActive).toBe(true);
      expect(updateResult.body.isDeleted).toBe(false);
      expect(updateResult.body.modifiedBy).toBeTruthy();
      expect(updateResult.body.modifiedUtc).toBeTruthy();

      // Verify that the update was persisted.
      const getResult = await organizationClient.getUserGroupById(
        authenticatedUser.accessToken,
        userGroupId
      );

      expect(getResult.response.status()).toBe(200);
      expect(getResult.body.name).toBe(updatedName);
      expect(getResult.body.description).toBe(updatedDescription);
      expect(getResult.body.isActive).toBe(true);
    }
  );

  test(
    'should delete a user group',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const uniqueName = `PW Delete Group ${Date.now()}`;

      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: uniqueName,
        description: 'Created for delete test'
      });

      expect(createResult.response.status()).toBe(201);

      const userGroupId = createResult.body.userGroupId;

      const deleteResult = await organizationClient.deleteUserGroup(
        authenticatedUser.accessToken,
        userGroupId
      );

      expect(deleteResult.response.status()).toBe(200);

      expect(deleteResult.body.userGroupId).toBe(userGroupId);
      expect(deleteResult.body.name).toBe(uniqueName);
      expect(deleteResult.body.isDeleted).toBe(true);

      // Verify that the deleted group is no longer accessible.
      const getResponse = await organizationClient.getUserGroupByIdResponse(
        authenticatedUser.accessToken,
        userGroupId
      );

      expect(getResponse.status()).toBe(404);
    }
  );

  test(
    'should add, search and remove a user group member',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      // Create an independent group for membership testing.
      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: `PW Membership Group ${Date.now()}`,
        description: 'Created for membership lifecycle test'
      });

      expect(createResult.response.status()).toBe(201);

      const userGroupId = createResult.body.userGroupId;

      // Find an active and approved organization user.
      const usersResult = await organizationClient.searchUsers(authenticatedUser.accessToken, {
        isActive: true,
        isApproved: true,
        pageNumber: 1,
        pageSize: 25
      });

      expect(usersResult.response.status()).toBe(200);
      expect(usersResult.body.items.length).toBeGreaterThan(0);

      const organizationUser = usersResult.body.items[0];

      expect(organizationUser.organizationUserId).toBeGreaterThan(0);

      // Add the organization user to the group.
      const addResult = await organizationClient.addUserGroupMember(
        authenticatedUser.accessToken,
        userGroupId,
        {
          organizationUserId: organizationUser.organizationUserId
        }
      );

      expect(addResult.response.status()).toBe(201);

      expect(addResult.body.userGroupId).toBe(userGroupId);
      expect(addResult.body.organizationUserId).toBe(organizationUser.organizationUserId);
      expect(addResult.body.identityUserId).toBe(organizationUser.identityUserId);
      expect(addResult.body.createdBy).toBeTruthy();
      expect(addResult.body.createdUtc).toBeTruthy();

      // Verify that the membership exists.
      const membersResult = await organizationClient.searchUserGroupMembers(
        authenticatedUser.accessToken,
        userGroupId,
        {
          pageNumber: 1,
          pageSize: 25
        }
      );

      expect(membersResult.response.status()).toBe(200);
      expect(membersResult.body.totalCount).toBeGreaterThan(0);

      const member = membersResult.body.items.find(
        (item) => item.organizationUserId === organizationUser.organizationUserId
      );

      expect(member).toBeDefined();
      expect(member!.userGroupId).toBe(userGroupId);
      expect(member!.organizationUserId).toBe(organizationUser.organizationUserId);
      expect(member!.identityUserId).toBe(organizationUser.identityUserId);

      // Remove the organization user from the group.
      const removeResponse = await organizationClient.removeUserGroupMember(
        authenticatedUser.accessToken,
        userGroupId,
        organizationUser.organizationUserId
      );

      expect(removeResponse.status()).toBe(204);

      // Verify that the membership is no longer returned.
      const membersAfterRemove = await organizationClient.searchUserGroupMembers(
        authenticatedUser.accessToken,
        userGroupId,
        {
          pageNumber: 1,
          pageSize: 25
        }
      );

      expect(membersAfterRemove.response.status()).toBe(200);

      const removedMember = membersAfterRemove.body.items.find(
        (item) => item.organizationUserId === organizationUser.organizationUserId
      );

      expect(removedMember).toBeUndefined();
    }
  );

  test(
    'should return 401 when searching user groups without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.searchUserGroupsWithoutToken();

      expect(response.status()).toBe(401);
    }
  );

  test(
    'should return 401 when creating user group without access token',
    { tag: ['@regression'] },
    async ({ organizationClient }) => {
      const response = await organizationClient.createUserGroupWithoutToken({
        name: `PW Unauthorized Group ${Date.now()}`,
        description: 'Unauthorized create test'
      });

      expect(response.status()).toBe(401);
    }
  );

  test(
    'should return 404 for unknown user group id',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const unknownUserGroupId = '11111111-1111-1111-1111-111111111111';

      const response = await organizationClient.getUserGroupByIdResponse(
        authenticatedUser.accessToken,
        unknownUserGroupId
      );

      expect(response.status()).toBe(404);
    }
  );

  test(
    'should return 400 when user group name is blank',
    { tag: ['@regression'] },
    async ({ organizationClient, authenticatedUser }) => {
      const response = await organizationClient.createUserGroupResponse(
        authenticatedUser.accessToken,
        {
          name: '   ',
          description: 'Invalid blank name test'
        }
      );

      expect(response.status()).toBe(400);
    }
  );
  test(
    'should return 409 when creating duplicate user group name',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const duplicateName = `PW Duplicate Group ${Date.now()}`;

      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: duplicateName,
        description: 'Original user group'
      });

      expect(createResult.response.status()).toBe(201);

      const duplicateResponse = await organizationClient.createUserGroupResponse(
        authenticatedUser.accessToken,
        {
          name: duplicateName,
          description: 'Duplicate user group'
        }
      );

      expect(duplicateResponse.status()).toBe(409);
    }
  );
  test(
    'should return 409 when adding duplicate user group member',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      // Create an independent user group.
      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: `PW Duplicate Member Group ${Date.now()}`,
        description: 'Created for duplicate membership test'
      });

      expect(createResult.response.status()).toBe(201);

      const userGroupId = createResult.body.userGroupId;

      // Find a valid organization user.
      const usersResult = await organizationClient.searchUsers(authenticatedUser.accessToken, {
        isActive: true,
        isApproved: true,
        pageNumber: 1,
        pageSize: 25
      });

      expect(usersResult.response.status()).toBe(200);
      expect(usersResult.body.items.length).toBeGreaterThan(0);

      const organizationUser = usersResult.body.items[0];

      // Add member the first time.
      const firstAddResult = await organizationClient.addUserGroupMember(
        authenticatedUser.accessToken,
        userGroupId,
        {
          organizationUserId: organizationUser.organizationUserId
        }
      );

      expect(firstAddResult.response.status()).toBe(201);

      // Attempt to add the same member again.
      const duplicateResponse = await organizationClient.addUserGroupMemberResponse(
        authenticatedUser.accessToken,
        userGroupId,
        {
          organizationUserId: organizationUser.organizationUserId
        }
      );

      expect(duplicateResponse.status()).toBe(409);
    }
  );
  test(
    'should return 400 when adding member with invalid organization user id',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: `PW Invalid Member Group ${Date.now()}`,
        description: 'Created for invalid member validation test'
      });

      expect(createResult.response.status()).toBe(201);

      const response = await organizationClient.addUserGroupMemberResponse(
        authenticatedUser.accessToken,
        createResult.body.userGroupId,
        {
          organizationUserId: 0
        }
      );

      expect(response.status()).toBe(400);
    }
  );
  test(
    'should return 404 when adding nonexistent organization user to user group',
    { tag: ['@regression', '@data-creation'] },
    async ({ organizationClient, authenticatedUser }) => {
      const createResult = await organizationClient.createUserGroup(authenticatedUser.accessToken, {
        name: `PW Unknown Member Group ${Date.now()}`,
        description: 'Created for nonexistent member test'
      });

      expect(createResult.response.status()).toBe(201);

      const response = await organizationClient.addUserGroupMemberResponse(
        authenticatedUser.accessToken,
        createResult.body.userGroupId,
        {
          organizationUserId: 2147483647
        }
      );

      expect(response.status()).toBe(404);
    }
  );
});
