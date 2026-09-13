const APPLICATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const APPLICATION_RETURN_KEY = 'keepid.applicationReturn';

export const applicationSearch = (id: string): string => `?applicationId=${encodeURIComponent(id)}`;

export const applicationReturnPath = (pathname: string, search: string): string | null => {
  if (pathname !== '/applications/preview' && pathname !== '/applications/edit') return null;
  const id = new URLSearchParams(search).get('applicationId');
  return id && APPLICATION_ID.test(id) ? `${pathname}${applicationSearch(id)}` : null;
};

export const validApplicationId = (id: string): boolean => APPLICATION_ID.test(id);

export const rememberApplicationLink = (): void => {
  const target = applicationReturnPath(window.location.pathname, window.location.search);
  if (target) sessionStorage.setItem(APPLICATION_RETURN_KEY, target);
};

export const pendingApplicationLink = (): string | null => {
  const saved = sessionStorage.getItem(APPLICATION_RETURN_KEY);
  if (!saved) return null;
  const split = saved.indexOf('?');
  return split < 0 ? null : applicationReturnPath(saved.slice(0, split), saved.slice(split));
};
