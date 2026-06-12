import getServerURL from '../serverOverride';

export const SESSION_EXPIRED_EVENT = 'keepid:session-expired';

let installed = false;

const publicAuthPaths = new Set([
  '/login',
  '/logout',
  '/authenticate',
  '/get-session-user',
  '/forgot-password',
  '/reset-password',
  '/username-exists',
  '/organization-signup',
  '/googleLoginRequest',
  '/googleLoginResponse',
  '/microsoftLoginRequest',
  '/microsoftLoginResponse',
]);

function requestPath(input: RequestInfo | URL): string | null {
  const rawUrl = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
  try {
    const parsed = new URL(rawUrl, window.location.origin);
    const server = new URL(getServerURL());
    if (parsed.origin !== server.origin) return null;
    return parsed.pathname;
  } catch {
    return null;
  }
}

function shouldWatchRequest(input: RequestInfo | URL): boolean {
  const path = requestPath(input);
  if (!path) return false;
  return !publicAuthPaths.has(path);
}

function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

async function inspectAuthFailure(input: RequestInfo | URL, response: Response): Promise<void> {
  if (!shouldWatchRequest(input)) return;

  if (response.status === 401 || response.status === 403) {
    dispatchSessionExpired();
    return;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return;

  try {
    const body = await response.clone().json();
    if (body?.status === 'AUTH_FAILURE') {
      dispatchSessionExpired();
    }
  } catch {
    // Binary downloads and non-JSON responses are not auth signals.
  }
}

export function installSessionExpiryInterceptor(): void {
  if (installed || typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  installed = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init);
    inspectAuthFailure(input, response).catch(() => undefined);
    return response;
  };
}
