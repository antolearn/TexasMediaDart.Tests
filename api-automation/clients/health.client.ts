import { APIRequestContext, expect } from '@playwright/test';

export type HealthService = {
  name: string;
  baseUrl: string;
};

export type ApiHealthResponse = {
  status: string;
  service: string;
  timestampUtc: string;
};

export type DbHealthResponse = {
  status: string;
  database: string;
  databaseVersion: string;
  timestampUtc: string;
};

export type VersionHealthResponse = {
  application: string;
  version: string;
  environment: string;
  timestampUtc: string;
};

export class HealthClient {
  constructor(private readonly request: APIRequestContext) {}

  async validateApiHealth(service: HealthService): Promise<void> {
    const response = await this.request.get(
      `${service.baseUrl}/health/api`
    );

    expect(response.status()).toBe(200);

    const body = (await response.json()) as ApiHealthResponse;

    expect(body.status).toBe('Healthy');
    expect(body.service).toBeTruthy();
    expect(body.timestampUtc).toBeTruthy();
  }

  async validateDatabaseHealth(service: HealthService): Promise<void> {
    const response = await this.request.get(
      `${service.baseUrl}/health/db`
    );

    expect(response.status()).toBe(200);

    const body = (await response.json()) as DbHealthResponse;

    expect(body.status).toBe('Healthy');
    expect(body.database).toBeTruthy();
    expect(body.databaseVersion).toBeTruthy();
    expect(body.timestampUtc).toBeTruthy();
  }

  async validateVersionHealth(service: HealthService): Promise<void> {
    const response = await this.request.get(
      `${service.baseUrl}/health/version`
    );

    expect(response.status()).toBe(200);

    const body = (await response.json()) as VersionHealthResponse;

    expect(body.application).toBeTruthy();
    expect(body.version).toBeTruthy();
    expect(body.environment).toBeTruthy();
    expect(body.timestampUtc).toBeTruthy();
  }
}