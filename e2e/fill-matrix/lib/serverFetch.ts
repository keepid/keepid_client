/**
 * Points the client's own fetch calls at the scratch server and keeps a cookie jar, so the
 * harness can call the real API modules (getQuestionsV2, fillPdfBlob, ...) under Node.
 * The client builds URLs from getServerURL(), which resolves to http://localhost:7001 in dev.
 */
export const CLIENT_API_ORIGIN = 'http://localhost:7001';

const cookies = new Map<string, string>();

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

export function installServerFetch(baseUrl: string): void {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = urlOf(input);
    const url = raw.startsWith(CLIENT_API_ORIGIN) ? `${baseUrl}${raw.slice(CLIENT_API_ORIGIN.length)}` : raw;
    const headers = new Headers(init?.headers);
    if (cookies.size > 0) {
      headers.set('cookie', [...cookies].map(([name, value]) => `${name}=${value}`).join('; '));
    }
    const response = await realFetch(url, { ...init, headers });
    response.headers.getSetCookie().forEach((line) => {
      const pair = line.split(';')[0];
      const eq = pair.indexOf('=');
      if (eq > 0) cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    });
    return response;
  }) as typeof fetch;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${CLIENT_API_ORIGIN}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<T>(path, response);
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${CLIENT_API_ORIGIN}${path}`);
  return parseJsonResponse<T>(path, response);
}

async function parseJsonResponse<T>(path: string, response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${path} returned HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
}
