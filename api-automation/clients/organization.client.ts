import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CurrentOrganization,
  OrganizationUserSearchParameters,
  OrganizationUserSearchResult,
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
}
