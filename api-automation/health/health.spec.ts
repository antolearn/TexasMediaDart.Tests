import { test } from '@playwright/test';
import { HealthClient, HealthService } from '../clients/health.client';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value.replace(/\/$/, '');
}

const services: HealthService[] = [
  {
    name: 'Main API',
    baseUrl: requireEnv('API_BASE_URL')
  },
  {
    name: 'Identity API',
    baseUrl: requireEnv('IDENTITY_BASE_URL')
  },
  {
    name: 'Organization API',
    baseUrl: requireEnv('ORGANIZATION_BASE_URL')
  }
];

test.describe('Service Health @smoke @regression', () => {
  for (const service of services) {
    test(`${service.name} API health`, async ({ request }) => {
      const client = new HealthClient(request);

      await client.validateApiHealth(service);
    });

    test(`${service.name} database health`, async ({ request }) => {
      const client = new HealthClient(request);

      await client.validateDatabaseHealth(service);
    });

    test(`${service.name} version health`, async ({ request }) => {
      const client = new HealthClient(request);

      await client.validateVersionHealth(service);
    });
  }
});
