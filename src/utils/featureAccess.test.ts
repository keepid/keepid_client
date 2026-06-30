import { describe, expect, it } from 'vitest';

import Role from '../static/Role';
import {
  canUseApplications,
  canUseClientNotifications,
  canUseCommunications,
  isTeamKeepOrganization,
} from './featureAccess';

describe('feature access policy', () => {
  it('recognizes Team Keep by organization name', () => {
    expect(isTeamKeepOrganization('Team Keep')).toBe(true);
    expect(isTeamKeepOrganization(' team keep ')).toBe(true);
    expect(isTeamKeepOrganization('Demo Org')).toBe(false);
  });

  it('allows applications only for signed-in Team Keep users', () => {
    expect(canUseApplications(Role.Client, 'Team Keep')).toBe(true);
    expect(canUseApplications(Role.Worker, 'Team Keep')).toBe(true);
    expect(canUseApplications(Role.Admin, 'Demo Org')).toBe(false);
    expect(canUseApplications(Role.LoggedOut, 'Team Keep')).toBe(false);
  });

  it('allows communications only for Team Keep admins and directors', () => {
    expect(canUseCommunications(Role.Admin, 'Team Keep')).toBe(true);
    expect(canUseCommunications(Role.Director, 'Team Keep')).toBe(true);
    expect(canUseCommunications(Role.Worker, 'Team Keep')).toBe(false);
    expect(canUseCommunications(Role.Admin, 'Demo Org')).toBe(false);
  });

  it('uses the communications policy for client notifications', () => {
    expect(canUseClientNotifications(Role.Admin, 'Team Keep')).toBe(true);
    expect(canUseClientNotifications(Role.Worker, 'Team Keep')).toBe(false);
  });
});
