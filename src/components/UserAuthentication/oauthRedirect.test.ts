import { describe, expect, it } from 'vitest';

import { buildOAuthRedirectUri } from './oauthRedirect';

describe('buildOAuthRedirectUri', () => {
  it('uses the server origin when getServerURL returns an absolute URL', () => {
    expect(
      buildOAuthRedirectUri(
        'http://localhost:7001',
        '/googleLoginResponse',
        'http://localhost:3000',
      ),
    ).toBe('http://localhost:7001/googleLoginResponse');
  });

  it('uses the browser origin when getServerURL returns a relative path', () => {
    expect(
      buildOAuthRedirectUri(
        '/api',
        '/microsoftLoginResponse',
        'https://app.keep.id',
      ),
    ).toBe('https://app.keep.id/api/microsoftLoginResponse');
  });

  it('does not duplicate slashes around the callback path', () => {
    expect(
      buildOAuthRedirectUri(
        'https://server.keep.id/',
        'googleLoginResponse',
        'https://keep.id',
      ),
    ).toBe('https://server.keep.id/googleLoginResponse');
  });
});
