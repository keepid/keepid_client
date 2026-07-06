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

/**
 * Normalize common date string shapes to MM/DD/YYYY for autofill/display contexts.
 * Leaves non-date strings unchanged.
 */
export function normalizeDateLikeValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;

  let m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
  if (m) return `${m[2]}/${m[3]}/${m[1]}`;

  m = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;

  return value;
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
  m = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) {
    const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatMonthDayYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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

function isBlankValue(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function stripDirectiveNamespace(directive: string): string {
  const trimmed = directive.trim();
  const lastColon = trimmed.lastIndexOf(':');
  return lastColon >= 0 && lastColon + 1 < trimmed.length
    ? trimmed.slice(lastColon + 1)
    : trimmed;
}

function splitDirectiveNamespace(directive: string): { namespace: string; path: string } {
  const trimmed = directive.trim();
  const lastColon = trimmed.lastIndexOf(':');
  if (lastColon >= 0 && lastColon + 1 < trimmed.length) {
    return { namespace: trimmed.slice(0, lastColon + 1), path: trimmed.slice(lastColon + 1) };
  }
  return { namespace: '', path: trimmed };
}

const DIRECTIVE_ALIASES: Record<string, string> = {
  dob: 'birthDate',
  dateOfBirth: 'birthDate',
  emailAddress: 'email',
  genderAssignedAtBirth: 'sex',
  motherFirstName: 'motherName.first',
  motherMiddleName: 'motherName.middle',
  motherLastName: 'motherName.last',
  motherMaidenName: 'motherName.maiden',
  fatherFirstName: 'fatherName.first',
  fatherMiddleName: 'fatherName.middle',
  fatherLastName: 'fatherName.last',
  fatherMaidenName: 'fatherName.maiden',
};

function normalizeDirectiveAlias(path: string): string {
  const scopeMatch = path.match(/^(client|worker|director|org)\.(.+)$/i);
  const scope = scopeMatch?.[1].toLowerCase();
  const localPath = scopeMatch?.[2] ?? path;
  const aliasedPath = DIRECTIVE_ALIASES[localPath] ?? localPath;
  const parentNameAlias = aliasedPath.match(/^(mother|father)(?:Name|\.name)?\.(first|middle|last|suffix|maiden)$/i);
  if (parentNameAlias) {
    const root = parentNameAlias[1].toLowerCase() === 'father' ? 'fatherName' : 'motherName';
    const normalized = `${root}.${parentNameAlias[2].toLowerCase()}`;
    return scope ? `${scope}.${normalized}` : normalized;
  }
  return scope ? `${scope}.${aliasedPath}` : aliasedPath;
}

function resolveProfilePath(profile: Record<string, unknown> | undefined, path: string): unknown {
  const value = getByPath(profile, path);
  if (!isBlankValue(value)) return value;

  const nameAlias: Record<string, string> = {
    'currentName.first': 'firstName',
    'currentName.middle': 'middleName',
    'currentName.last': 'lastName',
    'currentName.suffix': 'suffix',
  };
  const fallbackPath = nameAlias[path];
  return fallbackPath ? getByPath(profile, fallbackPath) : value;
}

function isMotherMaidenTarget(targetName: unknown): boolean {
  if (typeof targetName !== 'string') return false;
  const normalized = targetName.toLowerCase();
  return normalized.includes('mother') && normalized.includes('maiden');
}

function isMotherLastDirective(directive: string): boolean {
  return /^(client\.)?motherName\.last$/i.test(directive);
}

export function canonicalDirectiveForTarget(directiveKey: string, targetName?: unknown): string {
  const { namespace, path } = splitDirectiveNamespace(directiveKey);
  const directive = normalizeDirectiveAlias(path);

  if (isMotherMaidenTarget(targetName) && isMotherLastDirective(directive)) {
    return `${namespace}${directive.toLowerCase().startsWith('client.') ? 'client.' : ''}motherName.maiden`;
  }
  return `${namespace}${directive}`;
}

/** Full name for a profile scope: prefer structured currentName, else firstName/lastName. */
function computeFullName(profile: Record<string, unknown> | undefined): string | undefined {
  if (!profile) return undefined;
  const part = (path: string) => String(getByPath(profile, path) ?? '').trim();
  const fromCurrentName = [
    part('currentName.first'),
    part('currentName.middle'),
    part('currentName.last'),
    part('currentName.suffix'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (fromCurrentName) return fromCurrentName;
  const fromColumns = [part('firstName'), part('lastName')].filter(Boolean).join(' ').trim();
  return fromColumns || undefined;
}

/** Format a full address from an address-prefixed object: "line1, line2, City, ST ZIP". */
function computeFullAddress(
  profile: Record<string, unknown> | undefined,
  prefixes: string[],
): string | undefined {
  if (!profile) return undefined;
  return prefixes
    .map((prefix) => {
      const at = (key: string) => String(getByPath(profile, `${prefix}.${key}`) ?? '').trim();
      const line1 = at('line1');
      const line2 = at('line2');
      const city = at('city');
      const state = at('state');
      const zip = at('zip') || at('zipcode');
      const cityStateZip = [city, [state, zip].filter(Boolean).join(' ').trim()]
        .filter(Boolean)
        .join(', ');
      const full = [line1, line2, cityStateZip].filter(Boolean).join(', ');
      return full || undefined;
    })
    .find(Boolean);
}

/** Extract a part (area code / prefix / line number) of the primary phone. */
function computePhonePart(
  profile: Record<string, unknown> | undefined,
  part: 'area' | 'prefix' | 'line',
): string | undefined {
  const raw = getByPath(profile, 'phoneBook.0.phoneNumber') ?? getByPath(profile, 'phone');
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length < 10) return undefined;
  if (part === 'area') return digits.slice(0, 3);
  if (part === 'prefix') return digits.slice(3, 6);
  return digits.slice(6);
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
  const normalizedDirective = stripDirectiveNamespace(canonicalDirectiveForTarget(directive));
  const lower = normalizedDirective.toLowerCase();

  const dobMatch = normalizedDirective.match(/^(client|worker|director)\.\$dob_mm\/dd\/yyyy$/i);
  if (dobMatch) {
    const profileKey = dobMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    const profile = profiles[profileKey];
    return normalizeDateLikeValue(getByPath(profile as Record<string, unknown> | undefined, 'birthDate'));
  }
  const longDobMatch = normalizedDirective
    .match(/^(client|worker|director)\.\$(dob_month_day_year|dob_mmmm_d_yyyy|dobMonthDayYear|birthDateLong)$/i);
  if (longDobMatch) {
    const profileKey = longDobMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    const birthDate = parseBirthDate(getByPath(profiles[profileKey] as Record<string, unknown> | undefined, 'birthDate'));
    return birthDate ? formatMonthDayYear(birthDate) : undefined;
  }
  const ageMatch = normalizedDirective.match(/^(client|worker|director)\.\$age$/i);
  if (ageMatch) {
    const profileKey = ageMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computeAgeFromBirthDate(profiles[profileKey] as Record<string, unknown> | undefined);
  }
  const monthNumberMatch = normalizedDirective.match(/^(client|worker|director)\.\$(birthMonth|dobMonthNumber)$/i);
  if (monthNumberMatch) {
    const profileKey = monthNumberMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computeBirthMonthNumber(profiles[profileKey] as Record<string, unknown> | undefined);
  }
  const phoneLast7Match = normalizedDirective
    .match(/^(client|worker|director)\.\$?(phoneLast7|phoneLastSeven|primaryPhoneLast7|primaryPhoneLastSeven|primaryPhoneNumber|primaryPhoneLocalNumber)$/i);
  if (phoneLast7Match) {
    const profileKey = phoneLast7Match[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computePhoneLast7(profiles[profileKey] as Record<string, unknown> | undefined);
  }

  const fullNameMatch = normalizedDirective.match(/^(client|worker|director)\.\$fullName$/i);
  if (fullNameMatch) {
    const profileKey = fullNameMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    return computeFullName(profiles[profileKey] as Record<string, unknown> | undefined);
  }

  const birthYearMatch = normalizedDirective.match(/^(client|worker|director)\.\$birthYear$/i);
  if (birthYearMatch) {
    const profileKey = birthYearMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    const birthDate = parseBirthDate(getByPath(profiles[profileKey] as Record<string, unknown> | undefined, 'birthDate'));
    return birthDate ? String(birthDate.getFullYear()) : undefined;
  }

  const birthDayMatch = normalizedDirective.match(/^(client|worker|director)\.\$birthDay$/i);
  if (birthDayMatch) {
    const profileKey = birthDayMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    const birthDate = parseBirthDate(getByPath(profiles[profileKey] as Record<string, unknown> | undefined, 'birthDate'));
    return birthDate ? String(birthDate.getDate()) : undefined;
  }

  if (/^(client|worker|director|org)\.\$date$/i.test(normalizedDirective)) {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}/${d.getFullYear()}`;
  }

  const phonePartMatch = normalizedDirective
    .match(/^(client|worker|director)\.\$primaryPhone(AreaCode|TelephonePrefix|LineNumber)$/i);
  if (phonePartMatch) {
    const profileKey = phonePartMatch[1].toLowerCase() as 'client' | 'worker' | 'director';
    const which = phonePartMatch[2].toLowerCase();
    const phonePartByDirective: Record<string, 'area' | 'prefix' | 'line'> = {
      areacode: 'area',
      telephoneprefix: 'prefix',
      linenumber: 'line',
    };
    const part = phonePartByDirective[which];
    return computePhonePart(profiles[profileKey] as Record<string, unknown> | undefined, part);
  }

  const fullAddrMatch = normalizedDirective
    .match(/^(client|worker|director|org)\.\$full(PersonalAddress|MailAddress|Address)$/i);
  if (fullAddrMatch) {
    const profileKey = fullAddrMatch[1].toLowerCase() as 'client' | 'worker' | 'director' | 'org';
    const which = fullAddrMatch[2].toLowerCase();
    const profile = profiles[profileKey] as Record<string, unknown> | undefined;
    if (which === 'personaladdress') return computeFullAddress(profile, ['personalAddress']);
    if (which === 'mailaddress') return computeFullAddress(profile, ['mailAddress']);
    if (profileKey === 'org') return computeFullAddress(profile, ['address', 'orgAddress']);
    return computeFullAddress(profile, ['personalAddress', 'mailAddress']);
  }

  const addressLine1And2 = resolveAddressLine1And2Directive(normalizedDirective, profiles);
  if (addressLine1And2 !== undefined) {
    return addressLine1And2;
  }

  if (lower.startsWith('client.') && profiles.client) {
    return normalizeDateLikeValue(resolveProfilePath(profiles.client, normalizedDirective.slice(7)));
  }
  if (lower.startsWith('worker.') && profiles.worker) {
    return normalizeDateLikeValue(resolveProfilePath(profiles.worker, normalizedDirective.slice(7)));
  }
  if (lower.startsWith('org.') && profiles.org) {
    const orgPath = normalizedDirective.slice(4);
    const orgAlias: Record<string, string> = {
      organizationName: 'name',
      phoneNumber: 'phone',
    };
    return normalizeDateLikeValue(getByPath(profiles.org, orgAlias[orgPath] ?? orgPath));
  }
  if (lower.startsWith('director.') && profiles.director) {
    return normalizeDateLikeValue(resolveProfilePath(profiles.director, normalizedDirective.slice(9)));
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

export function resolveDirectiveFromProfilesForTarget(
  directive: string,
  profiles: ResolvedProfiles | null | undefined,
  targetName?: unknown,
): unknown {
  return resolveDirectiveFromProfiles(canonicalDirectiveForTarget(directive, targetName), profiles);
}

const NAME_HISTORY_DIRECTIVE_RE = /^nameHistory\.\d+\.(first|middle|last|suffix|maiden)$/;

/**
 * Legal name, DOB, and name history are not saved from interactive forms (see server
 * UpdateProfileFromFormService#isExcludedFromInteractiveFormSync).
 */
export function isExcludedFromProfileFormSync(directiveKey: string): boolean {
  let d = stripDirectiveNamespace(canonicalDirectiveForTarget(directiveKey));
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
