import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  AddUserGroupMemberRequest,
  CreateRoleRequest,
  CreateUserGroupRequest,
  CurrentOrganization,
  OrganizationUserSearchParameters,
  OrganizationUserSearchResult,
  Role,
  RolePermission,
  RoleSearchParameters,
  RoleSearchResult,
  UpdateOrganizationRequest,
  UpdateRolePermissionsRequest,
  UpdateRoleRequest,
  UpdateUserGroupRequest,
  UserGroup,
  UserGroupMemberCreated,
  UserGroupMemberSearchParameters,
  UserGroupMemberSearchResult,
  UserGroupSearchParameters,
  UserGroupSearchResult,
  UserModulePermission
} from '../models/organization.models';

export class OrganizationApiClient {
  private readonly request: APIRequestContext;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext) {
    this.request = request;

    const baseUrl = process.env.ORGANIZATION_BASE_URL;

    if (!baseUrl) {
      throw new Error('ORGANIZATION_BASE_URL is not configured.');
    }

    this.baseUrl = baseUrl;
  }

  async createOrganizationResponse(accessToken: string, name: string): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/api/organizations`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: {
        name
      }
    });
  }

  async createOrganizationWithoutToken(name: string): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/api/organizations`, {
      data: {
        name
      }
    });
  }

  async getCurrentOrganization(accessToken: string): Promise<{
    response: APIResponse;
    body: CurrentOrganization;
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/organizations/current`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as CurrentOrganization;

    return {
      response,
      body
    };
  }

  async getCurrentModules(accessToken: string): Promise<{
    response: APIResponse;
    body: UserModulePermission[];
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/organizations/current/modules`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as UserModulePermission[];

    return {
      response,
      body
    };
  }

  async getCurrentOrganizationWithoutToken(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/organizations/current`);
  }

  async getCurrentModulesWithoutToken(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/organizations/current/modules`);
  }

  async searchUsers(
    accessToken: string,
    parameters: OrganizationUserSearchParameters = {}
  ): Promise<{
    response: APIResponse;
    body: OrganizationUserSearchResult;
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        ...(parameters.identityUserId && {
          identityUserId: parameters.identityUserId
        }),
        ...(parameters.isActive !== undefined && {
          isActive: parameters.isActive
        }),
        ...(parameters.isApproved !== undefined && {
          isApproved: parameters.isApproved
        }),
        ...(parameters.pageNumber !== undefined && {
          pageNumber: parameters.pageNumber
        }),
        ...(parameters.pageSize !== undefined && {
          pageSize: parameters.pageSize
        })
      }
    });

    const body = (await response.json()) as OrganizationUserSearchResult;

    return {
      response,
      body
    };
  }

  async searchUsersWithoutToken(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/users`);
  }

  async searchRoles(
    accessToken: string,
    parameters: RoleSearchParameters = {}
  ): Promise<{
    response: APIResponse;
    body: RoleSearchResult;
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/roles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        ...(parameters.search && {
          searchText: parameters.search
        }),
        ...(parameters.isActive !== undefined && {
          isActive: parameters.isActive
        }),
        ...(parameters.includeDeleted !== undefined && {
          includeDeleted: parameters.includeDeleted
        }),
        ...(parameters.sortBy !== undefined && {
          sortBy: parameters.sortBy
        }),
        ...(parameters.sortDirection !== undefined && {
          sortDirection: parameters.sortDirection
        }),
        ...(parameters.pageNumber !== undefined && {
          pageNumber: parameters.pageNumber
        }),
        ...(parameters.pageSize !== undefined && {
          pageSize: parameters.pageSize
        })
      }
    });

    const body = (await response.json()) as RoleSearchResult;

    return {
      response,
      body
    };
  }

  async searchRolesWithoutToken(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/roles`);
  }

  async searchRolesWithRawParameters(
    accessToken: string,
    parameters: Record<string, string>
  ): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/roles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: parameters
    });
  }

  async createRole(
    accessToken: string,
    request: CreateRoleRequest
  ): Promise<{
    response: APIResponse;
    body: Role;
  }> {
    const response = await this.request.post(`${this.baseUrl}/api/roles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });

    const body = (await response.json()) as Role;

    return {
      response,
      body
    };
  }

  async getRoleById(
    accessToken: string,
    roleId: string
  ): Promise<{
    response: APIResponse;
    body: Role;
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as Role;

    return {
      response,
      body
    };
  }

  async getRoleByIdResponse(accessToken: string, roleId: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async updateRole(
    accessToken: string,
    roleId: string,
    request: UpdateRoleRequest
  ): Promise<{
    response: APIResponse;
    body: Role;
  }> {
    const response = await this.request.put(`${this.baseUrl}/api/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });

    const body = (await response.json()) as Role;

    return {
      response,
      body
    };
  }

  async deleteRole(
    accessToken: string,
    roleId: string
  ): Promise<{
    response: APIResponse;
    body: Role;
  }> {
    const response = await this.request.delete(`${this.baseUrl}/api/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as Role;

    return {
      response,
      body
    };
  }

  async getRolePermissions(
    accessToken: string,
    roleId: string
  ): Promise<{
    response: APIResponse;
    body: RolePermission[];
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/roles/${roleId}/permissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as RolePermission[];

    return {
      response,
      body
    };
  }

  async updateRolePermissions(
    accessToken: string,
    roleId: string,
    request: UpdateRolePermissionsRequest
  ): Promise<{
    response: APIResponse;
    body: RolePermission[];
  }> {
    const response = await this.request.put(`${this.baseUrl}/api/roles/${roleId}/permissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });

    const body = (await response.json()) as RolePermission[];

    return {
      response,
      body
    };
  }

  async updateRolePermissionsResponse(
    accessToken: string,
    roleId: string,
    request: UpdateRolePermissionsRequest
  ): Promise<APIResponse> {
    return await this.request.put(`${this.baseUrl}/api/roles/${roleId}/permissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });
  }

  async updateRoleResponse(
    accessToken: string,
    roleId: string,
    request: UpdateRoleRequest
  ): Promise<APIResponse> {
    return await this.request.put(`${this.baseUrl}/api/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });
  }

  async getRolePermissionsResponse(accessToken: string, roleId: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/roles/${roleId}/permissions`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async updateCurrentOrganization(
    accessToken: string,
    request: UpdateOrganizationRequest
  ): Promise<{
    response: APIResponse;
    body: CurrentOrganization;
  }> {
    const response = await this.request.put(`${this.baseUrl}/api/organizations/current`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });

    const body = (await response.json()) as CurrentOrganization;

    return {
      response,
      body
    };
  }

  async updateCurrentOrganizationResponse(
    accessToken: string,
    request: UpdateOrganizationRequest
  ): Promise<APIResponse> {
    return await this.request.put(`${this.baseUrl}/api/organizations/current`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });
  }

  async updateCurrentOrganizationWithoutToken(
    request: UpdateOrganizationRequest
  ): Promise<APIResponse> {
    return await this.request.put(`${this.baseUrl}/api/organizations/current`, {
      data: request
    });
  }

  async createUserGroup(
    accessToken: string,
    request: CreateUserGroupRequest
  ): Promise<{
    response: APIResponse;
    body: UserGroup;
  }> {
    const response = await this.request.post(`${this.baseUrl}/api/user-groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });

    const body = (await response.json()) as UserGroup;

    return {
      response,
      body
    };
  }

  async searchUserGroups(
    accessToken: string,
    parameters: UserGroupSearchParameters = {}
  ): Promise<{
    response: APIResponse;
    body: UserGroupSearchResult;
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/user-groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        ...(parameters.searchText && {
          searchText: parameters.searchText
        }),
        ...(parameters.isActive !== undefined && {
          isActive: parameters.isActive
        }),
        ...(parameters.isApproved !== undefined && {
          isApproved: parameters.isApproved
        }),
        ...(parameters.pageNumber !== undefined && {
          pageNumber: parameters.pageNumber
        }),
        ...(parameters.pageSize !== undefined && {
          pageSize: parameters.pageSize
        })
      }
    });

    const body = (await response.json()) as UserGroupSearchResult;

    return {
      response,
      body
    };
  }

  async getUserGroupById(
    accessToken: string,
    userGroupId: string
  ): Promise<{
    response: APIResponse;
    body: UserGroup;
  }> {
    const response = await this.request.get(`${this.baseUrl}/api/user-groups/${userGroupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as UserGroup;

    return {
      response,
      body
    };
  }

  async updateUserGroup(
    accessToken: string,
    userGroupId: string,
    request: UpdateUserGroupRequest
  ): Promise<{
    response: APIResponse;
    body: UserGroup;
  }> {
    const response = await this.request.put(`${this.baseUrl}/api/user-groups/${userGroupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });

    const body = (await response.json()) as UserGroup;

    return {
      response,
      body
    };
  }

  async deleteUserGroup(
    accessToken: string,
    userGroupId: string
  ): Promise<{
    response: APIResponse;
    body: UserGroup;
  }> {
    const response = await this.request.delete(`${this.baseUrl}/api/user-groups/${userGroupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const body = (await response.json()) as UserGroup;

    return {
      response,
      body
    };
  }

  async getUserGroupByIdResponse(accessToken: string, userGroupId: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/user-groups/${userGroupId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async addUserGroupMember(
    accessToken: string,
    userGroupId: string,
    request: AddUserGroupMemberRequest
  ): Promise<{
    response: APIResponse;
    body: UserGroupMemberCreated;
  }> {
    const response = await this.request.post(
      `${this.baseUrl}/api/user-groups/${userGroupId}/members`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        data: request
      }
    );

    const body = (await response.json()) as UserGroupMemberCreated;

    return {
      response,
      body
    };
  }

  async searchUserGroupMembers(
    accessToken: string,
    userGroupId: string,
    parameters: UserGroupMemberSearchParameters = {}
  ): Promise<{
    response: APIResponse;
    body: UserGroupMemberSearchResult;
  }> {
    const response = await this.request.get(
      `${this.baseUrl}/api/user-groups/${userGroupId}/members`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          ...(parameters.isActive !== undefined && {
            isActive: parameters.isActive
          }),
          ...(parameters.isApproved !== undefined && {
            isApproved: parameters.isApproved
          }),
          ...(parameters.pageNumber !== undefined && {
            pageNumber: parameters.pageNumber
          }),
          ...(parameters.pageSize !== undefined && {
            pageSize: parameters.pageSize
          })
        }
      }
    );

    const body = (await response.json()) as UserGroupMemberSearchResult;

    return {
      response,
      body
    };
  }

  async removeUserGroupMember(
    accessToken: string,
    userGroupId: string,
    organizationUserId: number
  ): Promise<APIResponse> {
    return await this.request.delete(
      `${this.baseUrl}/api/user-groups/${userGroupId}/members/${organizationUserId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
  }
  async createUserGroupResponse(
    accessToken: string,
    request: CreateUserGroupRequest
  ): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/api/user-groups`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });
  }

  async createUserGroupWithoutToken(request: CreateUserGroupRequest): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/api/user-groups`, {
      data: request
    });
  }

  async searchUserGroupsWithoutToken(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/user-groups`);
  }

  async addUserGroupMemberResponse(
    accessToken: string,
    userGroupId: string,
    request: AddUserGroupMemberRequest
  ): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/api/user-groups/${userGroupId}/members`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      data: request
    });
  }
}
