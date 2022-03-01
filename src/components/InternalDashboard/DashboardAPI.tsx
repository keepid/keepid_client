import axios from 'axios';

import getServerURL from '../../serverOverride';
import {
  Organization,
  OrganizationUpdateRequest,
  User,
  UserUpdateRequest,
} from '../../types';
import { OrganizationCreateRequest } from '../../types/Organization';
import { UserCreateRequest } from '../../types/User';

function formatDate(date: Date) {
  const month = date.getMonth() + 1;
  const monthString = month < 10 ? `0${month}` : month;
  const day = date.getDate();
  const dayString = day < 10 ? `0${day}` : day;
  return `${monthString}-${dayString}-${date.getFullYear()}`;
}

function userToUserUpdateRequest(user: User): {} {
  const { birthDate, ...rest } = user;
  return {
    birthDate: birthDate && formatDate(new Date(birthDate)),
    ...rest,
  };
}

function formatUserCreateRequest(request: Partial<UserCreateRequest>): {} {
  const { birthDate, ...rest } = request;
  return {
    birthDate: birthDate && formatDate(new Date(birthDate)),
    ...rest,
  };
}

function orgToOrgUpdateRequest(org: Organization): OrganizationUpdateRequest {
  const {
    orgEmail,
    orgWebsite,
    orgEIN,
    orgStreetAddress,
    orgCity,
    orgState,
    orgZipcode,
    orgPhoneNumber,
  } = org;
  return {
    orgEmail,
    orgWebsite,
    orgEIN,
    orgStreetAddress,
    orgCity,
    orgState,
    orgZipcode,
    orgPhoneNumber,
  };
}

export default class DashboardAPI {
  static getAllOrgs(): Promise<Organization[]> {
    return axios
      .get(`${getServerURL()}/organizations`, { withCredentials: true })
      .then((res) => res.data);
  }

  static getAllUsers(): Promise<User[]> {
    return axios
      .get(`${getServerURL()}/users`, { withCredentials: true })
      .then((res) => res.data);
  }

  static getOrganizationUsers(orgId: string): Promise<User[]> {
    return axios
      .get(`${getServerURL()}/organizations/${orgId}/users`, {
        withCredentials: true,
      })
      .then((res) => res.data);
  }

  static deleteOrganization(org: Organization): Promise<void> {
    return axios.delete(
      `${getServerURL()}/organizations/${encodeURIComponent(org.id)}`,
      { withCredentials: true },
    );
  }

  static deleteUser(user: User): Promise<void> {
    return axios.delete(
      `${getServerURL()}/users/${encodeURIComponent(user.username)}`,
      { withCredentials: true },
    );
  }

  static updateOrganization(org: Organization): Promise<Organization> {
    console.log('UPDATING ORGANIZATION', org);
    return axios
      .patch(
        `${getServerURL()}/organizations/${encodeURIComponent(org.id)}`,
        orgToOrgUpdateRequest(org),
        { withCredentials: true },
      )
      .then((res) => {
        console.log(res.data);
        return res.data;
      });
  }

  static updateUser(user: User): Promise<User> {
    console.log('UPDATING USER', user, userToUserUpdateRequest(user));
    return axios
      .patch(
        `${getServerURL()}/users/${encodeURIComponent(user.username)}`,
        userToUserUpdateRequest(user),
        { withCredentials: true },
      )
      .then((res) => {
        console.log(res.data);
        return res.data;
      });
  }

  static createUser(request: Partial<UserCreateRequest>): Promise<User> {
    console.log('CREATING USER', request);
    return axios
      .post(`${getServerURL()}/users`, formatUserCreateRequest(request), {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        return res.data;
      });
  }

  static createOrganization(
    request: OrganizationCreateRequest,
  ): Promise<Organization> {
    console.log('CREATING ORG', request);
    return axios
      .post(`${getServerURL()}/organizations`, request, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data);
        return res.data;
      });
  }
}
