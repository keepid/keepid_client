export interface ResolvedProfiles {
  client?: Record<string, unknown>;
  worker?: Record<string, unknown>;
  org?: Record<string, unknown>;
  director?: Record<string, unknown>;
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

function parseBirthDate(raw: unknown): Date | undefined {
  if (typeof raw !== 'string' || !raw) return undefined;
  const v = raw.trim();
  let m: RegExpMatchArray | null;
  // yyyy-mm-dd
  m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  // mm-dd-yyyy or mm/dd/yyyy
  m = v.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (m) {
    const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

function computeAgeFromBirthDate(profile: Record<string, unknown> | undefined): string | undefined {
  const birthDate = parseBirthDate(getByPath(profile, 'birthDate'));
  if (!birthDate) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age >= 0 ? String(age) : undefined;
}

function computeBirthMonthNumber(profile: Record<string, unknown> | undefined): string | undefined {
  const birthDate = parseBirthDate(getByPath(profile, 'birthDate'));
  if (!birthDate) return undefined;
  return String(birthDate.getMonth() + 1);
}

function computePhoneLast7(profile: Record<string, unknown> | undefined): string | undefined {
  const raw = getByPath(profile, 'phoneBook.0.phoneNumber') ?? getByPath(profile, 'phone');
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7) return undefined;
  const lastSeven = digits.slice(-7);
  return `${lastSeven.slice(0, 3)}-${lastSeven.slice(3)}`;
}

function combineAddressLine1And2(
  profile: Record<string, unknown> | undefined,
  prefix: string,
): string | undefined {
  const line1 = String(getByPath(profile, `${prefix}.line1`) ?? '').trim();
  const line2 = String(getByPath(profile, `${prefix}.line2`) ?? '').trim();
  if (line1 && line2) return `${line1}, ${line2}`;
  if (line1) return line1;
  if (line2) return line2;
  return undefined;
}

function resolveAddressLine1And2Directive(
  directive: string,
  profiles: ResolvedProfiles,
): string | undefined {
  const match = directive.trim().match(
    /^(?:(client|worker|org|director)\.)?(?:(personalAddress|mailAddress|address|orgAddress)\.)?\$line1\+2$/i,
  );
  if (!match) return undefined;

  const profileKey = (match[1]?.toLowerCase() ?? 'client') as 'client' | 'worker' | 'org' | 'director';
  const rawPrefix = match[2]?.toLowerCase();
  const profile = profiles[profileKey] as Record<string, unknown> | undefined;
  if (!profile) return undefined;

  if (rawPrefix === 'personaladdress') return combineAddressLine1And2(profile, 'personalAddress');
  if (rawPrefix === 'mailaddress') return combineAddressLine1And2(profile, 'mailAddress');
  if (rawPrefix === 'orgaddress') return combineAddressLine1And2(profile, 'orgAddress');
  if (rawPrefix === 'address') {
    if (profileKey === 'org') {
      return combineAddressLine1And2(profile, 'address') ?? combineAddressLine1And2(profile, 'orgAddress');
    }
    return combineAddressLine1And2(profile, 'personalAddress') ?? combineAddressLine1And2(profile, 'mailAddress');
  }

  if (profileKey === 'org') {
    return combineAddressLine1And2(profile, 'address') ?? combineAddressLine1And2(profile, 'orgAddress');
  }
  return combineAddressLine1And2(profile, 'personalAddress') ?? combineAddressLine1And2(profile, 'mailAddress');
}

/** Resolve directive string to value from profiles, e.g. "client.currentName.first" */
export function resolveDirectiveFromProfiles(
  directive: string,
  profiles: ResolvedProfiles | null | undefined,
): unknown {
  if (!profiles) return undefined;
  const lower = directive.trim().toLowerCase();

  const dobMatch = directive.trim().match(/^(client|worker|director)\.\$dob_mm\/dd\/yyyy$/i);
  if (dobMatch) {
    const profileKey = dobMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    const profile = profiles[profileKey];
    return reformatDateToSlash(getByPath(profile as Record<string, unknown> | undefined, 'birthDate'));
  }
  const ageMatch = directive.trim().match(/^(client|worker|director)\.\$age$/i);
  if (ageMatch) {
    const profileKey = ageMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computeAgeFromBirthDate(profiles[profileKey] as Record<string, unknown> | undefined);
  }
  const monthNumberMatch = directive.trim().match(/^(client|worker|director)\.\$(birthMonth|dobMonthNumber)$/i);
  if (monthNumberMatch) {
    const profileKey = monthNumberMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computeBirthMonthNumber(profiles[profileKey] as Record<string, unknown> | undefined);
  }
  const phoneLast7Match = directive.trim().match(/^(client|worker|director)\.\$phoneLast7$/i);
  if (phoneLast7Match) {
    const profileKey = phoneLast7Match[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computePhoneLast7(profiles[profileKey] as Record<string, unknown> | undefined);
  }

  const addressLine1And2 = resolveAddressLine1And2Directive(directive, profiles);
  if (addressLine1And2 !== undefined) {
    return addressLine1And2;
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
  if (lower.startsWith('director.') && profiles.director) {
    return getByPath(profiles.director, directive.slice(9));
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

const NAME_HISTORY_DIRECTIVE_RE = /^nameHistory\.\d+\.(first|middle|last|suffix|maiden)$/;

/**
 * Legal name, DOB, and name history are not saved from interactive forms (see server
 * UpdateProfileFromFormService#isExcludedFromInteractiveFormSync).
 */
export function isExcludedFromProfileFormSync(directiveKey: string): boolean {
  let d = directiveKey.trim();
  const lastColon = d.lastIndexOf(':');
  if (lastColon >= 0 && lastColon + 1 < d.length) {
    d = d.slice(lastColon + 1);
  }
  if (d.startsWith('client.')) {
    d = d.slice('client.'.length);
  }
  if (d === 'birthDate' || d === 'firstName' || d === 'lastName' || d === 'middleName') {
    return true;
  }
  if (d.startsWith('currentName.')) {
    return true;
  }
  return NAME_HISTORY_DIRECTIVE_RE.test(d);
}
