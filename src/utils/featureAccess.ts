import Role from '../static/Role';

const FULL_FEATURE_ORG_NAMES = ['Team Keep'];

type RoleLike = Role | string | null | undefined;

function normalizedOrganizationName(organization?: string | null): string {
  return (organization || '').trim().toLowerCase();
}

export function isTeamKeepOrganization(organization?: string | null): boolean {
  const normalized = normalizedOrganizationName(organization);
  return FULL_FEATURE_ORG_NAMES.some((name) => normalizedOrganizationName(name) === normalized);
}

export function isAdminRole(role: RoleLike): boolean {
  return role === Role.Admin || role === Role.Director;
}

function isSignedInRole(role: RoleLike): boolean {
  return !!role && role !== Role.LoggedOut;
}

export function canUseApplications(role: RoleLike, organization?: string | null): boolean {
  return isSignedInRole(role) && isTeamKeepOrganization(organization);
}

export function canUseCommunications(role: RoleLike, organization?: string | null): boolean {
  return isAdminRole(role) && isTeamKeepOrganization(organization);
}

export function canUseClientNotifications(role: RoleLike, organization?: string | null): boolean {
  return canUseCommunications(role, organization);
}
