enum Role {
  Director = 'Director',
  Admin = 'Admin',
  Worker = 'Worker',
  Volunteer = 'Volunteer',
  Client = 'Client',
  Developer = 'Developer',
  LoggedOut = 'Logged-Out User',
}

export const roleFromString = (role: string): Role => {
  switch (role.toLowerCase()) {
    case 'director':
      return Role.Director;
    case 'admin':
      return Role.Admin;
    case 'worker':
      return Role.Worker;
    case 'client':
      return Role.Client;
    case 'developer':
      return Role.Developer;
    default:
      return Role.LoggedOut;
  }
};

const rolesCreatableBy: Record<Role, Role[]> = {
  [Role.Director]: [Role.Admin, Role.Worker, Role.Volunteer, Role.Client],
  [Role.Admin]: [Role.Worker, Role.Volunteer, Role.Client],
  [Role.Worker]: [Role.Volunteer, Role.Client],
  [Role.Volunteer]: [Role.Client],
  [Role.Client]: [],
  [Role.Developer]: [],
  [Role.LoggedOut]: [],
};

export const canAuthRoleCreateRole = (
  authRole: Role,
  roleToCreate: Role,
): boolean => rolesCreatableBy[authRole].includes(roleToCreate);

export default Role;
