import { rest, setupWorker } from 'msw';
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { useSelect, useValue } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import SignUpContext, {
  AccountInformationProperties,
  defaultSignUpContextValue,
  OrganizationInformationProperties,
} from './SignUp.context';
import { useSignupStageContext } from './SignUp.router';
import { onPropertyChange } from './SignUp.util';

let mockServerIsSetup = false;

const validUsernameSuccess = {
  status: 'SUCCESS',
};
const invalidUsername = {
  status: 'USERNAME_ALREADY_EXISTS',
};

export function setupMockServer() {
  const worker = setupWorker();
  worker.use(
    rest.post(`${getServerURL()}/username-exists`, (req, res, ctx) => {
      const reqBody =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.username === 'invalid') {
        return res(ctx.json(invalidUsername));
      }

      return res(ctx.json(validUsernameSuccess));
    }),
  );
  worker.use(
    rest.post(`${getServerURL()}/create-user`, (req, res, ctx) => {
      const reqBody =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      console.log('Creating user with body:', reqBody);

      return res(ctx.json({ status: 'ENROLL_SUCCESS' }));
    }),
  );
  worker.use(
    rest.post(`${getServerURL()}/organization-signup`, (req, res, ctx) => {
      const reqBody =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      console.log('Creating org/director with body:', reqBody);

      return res(ctx.json({ status: 'FAILED_ENROLLMENT', message: 'Manual Failure' }));
      // return res(ctx.json({ status: 'SUCCESSFUL_ENROLLMENT' }));
    }),
  );

  worker.start({ waitUntilReady: true });
}

type Props = {
  v1Component: JSX.Element;
  v2Component: JSX.Element;
}

const defaultAccountInformation = {
  firstname: 'John',
  lastname: 'Doe',
  birthDate: new Date('01-01-1980'),
  confirmPassword: 'p@S$w0rd',
  password: 'p@S$w0rd',
  username: 'john_doe_123',
};

const defaultOrganizationInformation = {
  ein: '12-1234567',
  orgAddress: '123 Main St',
  orgCity: 'Chicago',
  orgEmail: 'test@organization.com',
  orgName: 'My Test Organization',
  orgPhoneNumber: '12345678910',
  orgState: 'IL',
  orgWebsite: 'https://test-organization.com',
  orgZipcode: '60603',
};

const BaseSignupFixture = ({ v1Component, v2Component }: Props) => {
  const [v2] = useValue('Use V2', { defaultValue: true });
  const [populateDefaultValues] = useValue('Use Default Values', { defaultValue: true });
  const [authRole] = useSelect('Auth Role', { defaultValue: Role.Admin, options: [Role.Director, Role.Admin, Role.Worker, Role.Volunteer, Role.Developer] });
  const [personRole] = useSelect('Person Role', { defaultValue: Role.Client, options: [Role.Client, Role.Director, Role.Admin, Role.Worker, Role.Volunteer, Role.Developer] });

  // @ts-ignore
  const [accountInformation, setAccountInformation] = useState<AccountInformationProperties>({});
  // @ts-ignore
  const [organizationInformation, setOrganizationInformation] = useState<OrganizationInformationProperties>({});

  useEffect(() => {
    if (!mockServerIsSetup) {
      setupMockServer();
      mockServerIsSetup = true;
    }
  });

  useEffect(() => {
    if (populateDefaultValues) {
      setAccountInformation(defaultAccountInformation);
      setOrganizationInformation(defaultOrganizationInformation);
    } else {
      setAccountInformation({ firstname: '',
        lastname: '',
        birthDate: undefined,
        confirmPassword: '',
        password: '',
        username: '' });
      setOrganizationInformation({
        ein: '',
        orgAddress: '',
        orgCity: '',
        orgEmail: '',
        orgName: '',
        orgPhoneNumber: '',
        orgState: '',
        orgWebsite: '',
        orgZipcode: '',
      });
    }
  }, [populateDefaultValues]);

  const signUpStageState = useSignupStageContext();

  return (
    <IntlProvider locale="en">
      <Provider template={AlertTemplate} className="alert-provider-custom">
        <SignUpContext.Provider
          value={{
            ...defaultSignUpContextValue,
            signUpStageStateContext: signUpStageState,

            accountInformationContext: {
              values: accountInformation,
              onPropertyChange: onPropertyChange(accountInformation, setAccountInformation),
            },
            organizationInformationContext: {
              values: organizationInformation,
              onPropertyChange: onPropertyChange(organizationInformation, setOrganizationInformation),
            },
            authRole,
            personRole,
          }}
        >
          {v2 ? v2Component : v1Component}
        </SignUpContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

export default BaseSignupFixture;
