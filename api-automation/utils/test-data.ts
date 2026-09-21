export function generateUniqueEmail(): string {
  const timestamp = Date.now();

  return `identityautomation${timestamp}@example.com`;
}
