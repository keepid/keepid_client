export function buildOAuthRedirectUri(
  serverUrl: string,
  callbackPath: string,
  browserOrigin: string = window.location.origin,
) {
  const normalizedCallbackPath = callbackPath.startsWith('/')
    ? callbackPath
    : `/${callbackPath}`;

  if (/^https?:\/\//i.test(serverUrl)) {
    return new URL(normalizedCallbackPath, serverUrl).toString();
  }

  const normalizedServerPath = serverUrl.endsWith('/')
    ? serverUrl.slice(0, -1)
    : serverUrl;

  return `${browserOrigin}${normalizedServerPath}${normalizedCallbackPath}`;
}
