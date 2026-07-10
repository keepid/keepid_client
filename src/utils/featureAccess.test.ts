import { describe, expect, it } from 'vitest';

import Role from '../static/Role';
import {
  canUseApplications,
  canUseClientNotifications,
  canUseCommunications,
  hasFullFeatureIdentityOverride,
  isTeamKeepOrganization,
} from './featureAccess';

describe('feature access policy', () => {
  it('recognizes Team Keep by organization name', () => {
    expect(isTeamKeepOrganization('Team Keep')).toBe(true);
    expect(isTeamKeepOrganization(' team keep ')).toBe(true);
    expect(isTeamKeepOrganization('Demo Org')).toBe(false);
  });

  it('recognizes approved full-feature identity prefixes', () => {
    expect(hasFullFeatureIdentityOverride('danieljoo@keep.id')).toBe(true);
    expect(hasFullFeatureIdentityOverride(' ConnorChong+dev@keep.id ')).toBe(true);
    expect(hasFullFeatureIdentityOverride('steffencornwell')).toBe(true);
    expect(hasFullFeatureIdentityOverride('team.danieljoo@keep.id')).toBe(false);
  });

  it('allows applications only for signed-in Team Keep users', () => {
    expect(canUseApplications(Role.Client, 'Team Keep')).toBe(true);
    expect(canUseApplications(Role.Worker, 'Team Keep')).toBe(true);
    expect(canUseApplications(Role.Admin, 'Demo Org')).toBe(false);
    expect(canUseApplications(Role.LoggedOut, 'Team Keep')).toBe(false);
  });

  it('allows applications for approved full-feature identities outside Team Keep', () => {
    expect(canUseApplications(Role.Admin, 'Demo Org', 'danieljoo@keep.id')).toBe(true);
    expect(canUseApplications(Role.LoggedOut, 'Demo Org', 'danieljoo@keep.id')).toBe(false);
  });

  it('allows communications only for Team Keep staff', () => {
    expect(canUseCommunications(Role.Admin, 'Team Keep')).toBe(true);
    expect(canUseCommunications(Role.Director, 'Team Keep')).toBe(true);
    expect(canUseCommunications(Role.Worker, 'Team Keep')).toBe(true);
    expect(canUseCommunications(Role.Client, 'Team Keep')).toBe(false);
    expect(canUseCommunications(Role.Admin, 'Demo Org')).toBe(false);
  });

  it('allows communications for approved full-feature staff identities outside Team Keep', () => {
    expect(canUseCommunications(Role.Worker, 'Demo Org', 'connorchong@keep.id')).toBe(true);
    expect(canUseCommunications(Role.Client, 'Demo Org', 'connorchong@keep.id')).toBe(false);
  });

  it('keeps client notifications admin-only for Team Keep', () => {
    expect(canUseClientNotifications(Role.Admin, 'Team Keep')).toBe(true);
    expect(canUseClientNotifications(Role.Worker, 'Team Keep')).toBe(false);
  });

  it('allows client notifications for approved full-feature admin identities outside Team Keep', () => {
    expect(canUseClientNotifications(Role.Admin, 'Demo Org', 'steffencornwell@keep.id')).toBe(true);
    expect(canUseClientNotifications(Role.Worker, 'Demo Org', 'steffencornwell@keep.id')).toBe(false);
  });
});
