import { APIRequestContext, APIResponse } from "@playwright/test";

import { UserSearchParameters, UserSearchResult } from "../models/users.models";

export class UsersApiClient {
  private readonly request: APIRequestContext;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext) {
    this.request = request;

    const baseUrl = process.env.API_BASE_URL;

    if (!baseUrl) {
      throw new Error("API_BASE_URL is not configured.");
    }

    this.baseUrl = baseUrl;
  }

  async searchUsers(
    accessToken: string,
    parameters: UserSearchParameters = {},
  ): Promise<{
    response: APIResponse;
    body: UserSearchResult;
  }> {
    const params: Record<string, string> = {};

    if (parameters.identityUserId !== undefined) {
      params.identityUserId = parameters.identityUserId;
    }

    if (parameters.isActive !== undefined) {
      params.isActive = parameters.isActive.toString();
    }

    if (parameters.isApproved !== undefined) {
      params.isApproved = parameters.isApproved.toString();
    }

    if (parameters.pageNumber !== undefined) {
      params.pageNumber = parameters.pageNumber.toString();
    }

    if (parameters.pageSize !== undefined) {
      params.pageSize = parameters.pageSize.toString();
    }

    const response = await this.request.get(`${this.baseUrl}/api/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    const body = (await response.json()) as UserSearchResult;

    return {
      response,
      body,
    };
  }

  async searchUsersWithoutAuthentication(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/users`);
  }

  async searchUsersWithInvalidToken(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/api/users`, {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });
  }
}
