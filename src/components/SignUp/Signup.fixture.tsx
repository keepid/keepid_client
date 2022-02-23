import React, { useEffect } from 'react';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { useSelect, useValue } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, useHistory } from 'react-router-dom';

import Role from '../../static/Role';
import { setupMockServer } from './BaseSignupFixture';
import SignUpRouter from './SignUp.router';

let mockServerIsSetup = false;

function SignupFixtureInner({ path, authRole }) {
  const history = useHistory();
  useEffect(() => {
    history.push(path);
  }, [path]);
  return <SignUpRouter role={authRole} />;
}

export default function SignupFixture() {
  const [authRole] = useSelect('Auth Role', {
    defaultValue: Role.Admin,
    options: [
      Role.Director,
      Role.Admin,
      Role.Worker,
      Role.Volunteer,
      Role.Developer,
    ],
  });

  const [path] = useValue('URL Path', {
    defaultValue: '/person-signup/client',
  });

  useEffect(() => {
    if (!mockServerIsSetup) {
      setupMockServer();
      mockServerIsSetup = true;
    }
  });

  return (
    <MemoryRouter initialEntries={[path]}>
      <IntlProvider locale="en">
        <Provider template={AlertTemplate} className="alert-provider-custom">
          <SignupFixtureInner authRole={authRole} path={path} />
        </Provider>
      </IntlProvider>
    </MemoryRouter>
  );
}
