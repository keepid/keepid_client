import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import {
  AccountInformationProperties,
  OrganizationInformationProperties,
} from './SignUp.context';
import { birthDateStringConverter, formatUrl } from './SignUp.util';

export async function isUsernameAvailable(username: string): Promise<boolean> {
  return fetch(`${getServerURL()}/username-exists`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      username,
    }),
  })
    .then((response) => response.json())
    .then((responseJSON) => {
      const { status } = responseJSON;
      return status === 'SUCCESS';
    });
}

export async function getAllWorkersFromOrganizationToAssign(): Promise<any[]> {
  return fetch(`${getServerURL()}/get-all-members-by-role`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      role: Role.Worker,
    }),
  })
    .then((response) => response.json())
    .then((responseJSON) => {
      const { status } = responseJSON;
      if (status === 'SUCCESS') {
        console.log(responseJSON, 'response');
        return responseJSON.people;
      }
      return [];
    });
}

export async function assignWorkerToUser(
  user: string,
  workerUsernamesToAdd: string[],
): Promise<boolean> {
  return fetch(`${getServerURL()}/assign-worker-to-user`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      user,
      workerUsernamesToAdd,
    }),
  })
    .then((response) => response.json())
    .then((responseJSON) => {
      const { status } = responseJSON;
      return status === 'SUCCESS';
    });
}

async function _createUser({
  accountInformation,
  recaptchaPayload,
  personRole,
  orgName,
  endpoint,
}: {
  accountInformation: AccountInformationProperties;
  recaptchaPayload: string;
  personRole: string;
  orgName?: string;
  endpoint: string;
}) {
  const { firstname, lastname, birthDate, username, password } =
    accountInformation;

  const birthDateString = birthDateStringConverter(birthDate || new Date());

  return fetch(`${getServerURL()}/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      firstname,
      lastname,
      birthDate: birthDateString,
      email: '',
      phonenumber: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      twoFactorOn: false,
      username,
      password,
      personRole,
      recaptchaPayload,
      orgName,
    }),
  }).then((response) => response.json());
}

export function signupUser({
  accountInformation,
  recaptchaPayload,
  personRole,
}: {
  accountInformation: AccountInformationProperties;
  recaptchaPayload: string;
  personRole: string;
}) {
  const endpoint = 'create-user';

  return _createUser({
    accountInformation,
    recaptchaPayload,
    personRole,
    endpoint,
  });
}

export async function signupUserFromInvite({
  accountInformation,
  recaptchaPayload,
  personRole,
  orgName,
}: {
  accountInformation: AccountInformationProperties;
  recaptchaPayload: string;
  personRole: string;
  orgName: string;
}) {
  const endpoint = 'create-invited-user';

  return _createUser({
    accountInformation,
    recaptchaPayload,
    personRole,
    orgName,
    endpoint,
  });
}

export async function signupOrganization({
  accountInformation,
  organizationInformation,
  recaptchaPayload,
}: {
  accountInformation: AccountInformationProperties;
  organizationInformation: OrganizationInformationProperties;
  recaptchaPayload: string;
}) {
  const { firstname, lastname, birthDate, username, password } =
    accountInformation;
  const {
    orgWebsite: organizationWebsite,
    orgName: organizationName,
    ein: organizationEIN,
    orgAddress: organizationAddressStreet,
    orgCity: organizationAddressCity,
    orgState: organizationAddressState,
    orgZipcode: organizationAddressZipcode,
    orgEmail: organizationEmail,
    orgPhoneNumber: organizationPhoneNumber,
  } = organizationInformation;

  // @ts-ignore
  const birthDateString = birthDateStringConverter(birthDate);
  const revisedURL = formatUrl(organizationWebsite);

  return fetch(`${getServerURL()}/organization-signup`, {
    method: 'POST',
    body: JSON.stringify({
      organizationWebsite: revisedURL,
      organizationName,
      organizationEIN,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationEmail,
      organizationPhoneNumber,
      firstname,
      lastname,
      birthDate: birthDateString,
      email: '',
      phonenumber: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      username,
      password,
      personRole: 'Director',
      twoFactorOn: false,
      recaptchaPayload,
    }),
  }).then((response) => response.json());
}
