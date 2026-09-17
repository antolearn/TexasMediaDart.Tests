import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  LoginRequest,
  LoginResponse
} from '../models/login.models';
import { MeResponse } from '../models/me.models';

export class IdentityApiClient {

  private readonly request: APIRequestContext;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext) {
    this.request = request;

    const baseUrl = process.env.IDENTITY_BASE_URL;

    if (!baseUrl) {
      throw new Error('IDENTITY_BASE_URL is not configured.');
    }

    this.baseUrl = baseUrl;
  }

  async login(
    loginRequest: LoginRequest
  ): Promise<{ response: APIResponse; body: LoginResponse }> {

    const response = await this.request.post(
      `${this.baseUrl}/api/auth/login`,
      {
        data: loginRequest
      }
    );

    const body = await response.json() as LoginResponse;

    return {
      response,
      body
    };
  }

  async getMe(
  accessToken: string
    ): Promise<{ response: APIResponse; body: MeResponse }> {

    const response = await this.request.get(
        `${this.baseUrl}/api/auth/me`,
        {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
        }
    );

    const body = await response.json() as MeResponse;

    return {
        response,
        body
    };
    }
}