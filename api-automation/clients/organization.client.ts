import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CreateRoleRequest,
  CurrentOrganization,
  OrganizationUserSearchParameters,
  OrganizationUserSearchResult,
  Role,
  RolePermission,
  RoleSearchParameters,
  RoleSearchResult,
  UpdateRoleRequest,
  UserModulePermission,
  UpdateRolePermissionsRequest
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
          search: parameters.search
        }),
        ...(parameters.isActive !== undefined && {
          isActive: parameters.isActive
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
}
