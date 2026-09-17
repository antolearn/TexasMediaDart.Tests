import {
  test,
  expect
} from '../fixtures/auth.fixture';

test.describe('Identity API - About Me', () => {

  test(
    'should return current user with valid access token',
    async ({ identityClient, authenticatedUser }) => {

      const meResult = await identityClient.getMe(
        authenticatedUser.accessToken
      );

      expect(meResult.response.status()).toBe(200);

      expect(meResult.body.userId)
        .toBe(authenticatedUser.userId);

      expect(meResult.body.email)
        .toBe(authenticatedUser.email);
    }
  );

});