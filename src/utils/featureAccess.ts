import Role from '../static/Role';

const FULL_FEATURE_ORG_NAMES = ['Team Keep'];
const FULL_FEATURE_IDENTITY_PREFIXES = ['steffencornwell', 'danieljoo', 'connorchong'];

type RoleLike = Role | string | null | undefined;

function normalizedOrganizationName(organization?: string | null): string {
  return (organization || '').trim().toLowerCase();
}

function normalizedIdentity(identity?: string | null): string {
  return (identity || '').trim().toLowerCase();
}

export function isTeamKeepOrganization(organization?: string | null): boolean {
  const normalized = normalizedOrganizationName(organization);
  return FULL_FEATURE_ORG_NAMES.some((name) => normalizedOrganizationName(name) === normalized);
}

export function hasFullFeatureIdentityOverride(identity?: string | null): boolean {
  const normalized = normalizedIdentity(identity);
  return FULL_FEATURE_IDENTITY_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function canUseFullFeatureOrganization(
  organization?: string | null,
  identity?: string | null,
): boolean {
  return isTeamKeepOrganization(organization) || hasFullFeatureIdentityOverride(identity);
}

export function isAdminRole(role: RoleLike): boolean {
  return role === Role.Admin || role === Role.Director;
}

export function isStaffRole(role: RoleLike): boolean {
  return role === Role.Worker || isAdminRole(role);
}

function isSignedInRole(role: RoleLike): boolean {
  return !!role && role !== Role.LoggedOut;
}

export function canUseApplications(
  role: RoleLike,
  organization?: string | null,
  identity?: string | null,
): boolean {
  return isSignedInRole(role) && canUseFullFeatureOrganization(organization, identity);
}

export function canUseCommunications(
  role: RoleLike,
  organization?: string | null,
  identity?: string | null,
): boolean {
  return isStaffRole(role) && canUseFullFeatureOrganization(organization, identity);
}

export function canUseClientNotifications(
  role: RoleLike,
  organization?: string | null,
  identity?: string | null,
): boolean {
  return isAdminRole(role) && canUseFullFeatureOrganization(organization, identity);
}
