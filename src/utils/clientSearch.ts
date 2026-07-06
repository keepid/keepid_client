export interface ClientSearchable {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export function normalizeClientSearchText(value: string | undefined | null): string {
  return (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function getClientSearchCandidateQueries(query: string, includeEmpty = false): string[] {
  const trimmedQuery = query.trim().replace(/\s+/g, ' ');
  if (!trimmedQuery) return includeEmpty ? [''] : [];

  const candidates = [
    trimmedQuery,
    ...trimmedQuery.split(' ').filter((token) => token.length >= 2),
  ];
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = candidate.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function matchesClientSearchQuery(client: ClientSearchable, query: string): boolean {
  const normalizedQuery = normalizeClientSearchText(query);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  if (tokens.length === 0) return true;

  const first = normalizeClientSearchText(client.firstName);
  const last = normalizeClientSearchText(client.lastName);
  const full = normalizeClientSearchText(`${client.firstName || ''} ${client.lastName || ''}`);
  const username = normalizeClientSearchText(client.username);
  const phone = normalizeClientSearchText(client.phone);
  const email = normalizeClientSearchText(client.email);

  return tokens.every((token) => (
    first.includes(token)
    || last.includes(token)
    || full.includes(token)
    || username.includes(token)
    || phone.includes(token)
    || email.includes(token)
  ));
}
