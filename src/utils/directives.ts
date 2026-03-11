export interface ResolvedProfiles {
  client?: Record<string, unknown>;
  worker?: Record<string, unknown>;
  org?: Record<string, unknown>;
}

/**
 * Get value by dot path. Handles both:
 * - Nested: obj.currentName.first
 * - Flattened (server format): obj["currentName.first"]
 */
export function getByPath(
  obj: Record<string, unknown> | undefined,
  path: string,
): unknown {
  if (!obj) return undefined;
  // Server returns flattened keys like "currentName.first" - try direct lookup first
  const direct = obj[path];
  if (direct !== undefined && direct !== null) return direct;
  // Fall back to nested traversal
  const parts = path.split('.');
  return parts.reduce<unknown>((acc, p) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[p];
  }, obj);
}

/** Reformat a date string like "01-21-2004" or "2004-01-21" to mm/dd/yyyy. */
function reformatDateToSlash(raw: unknown): string | undefined {
  if (typeof raw !== 'string' || !raw) return undefined;
  const parts = raw.split('-');
  if (parts.length !== 3) return undefined;
  if (parts[0].length === 4) return `${parts[1]}/${parts[2]}/${parts[0]}`;
  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

/** Resolve directive string to value from profiles, e.g. "client.currentName.first" */
export function resolveDirectiveFromProfiles(
  directive: string,
  profiles: ResolvedProfiles | null | undefined,
): unknown {
  if (!profiles) return undefined;
  const lower = directive.trim().toLowerCase();

  const dobMatch = directive.trim().match(/^(client|worker)\.\$dob_mm\/dd\/yyyy$/i);
  if (dobMatch) {
    const profileKey = dobMatch[1].toLowerCase() as 'client' | 'worker';
    const profile = profiles[profileKey];
    return reformatDateToSlash(getByPath(profile as Record<string, unknown> | undefined, 'birthDate'));
  }

  if (lower.startsWith('client.') && profiles.client) {
    return getByPath(profiles.client, directive.slice(7));
  }
  if (lower.startsWith('worker.') && profiles.worker) {
    return getByPath(profiles.worker, directive.slice(7));
  }
  if (lower.startsWith('org.') && profiles.org) {
    return getByPath(profiles.org, directive.slice(4));
  }
  if (lower === 'anydate' || lower === 'currentdate') {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  return undefined;
}
