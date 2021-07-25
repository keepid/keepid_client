import React from 'react';
import { Provider, transitions, useAlert } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelect, useValue } from 'react-cosmos/fixture';
import { MemoryRouter } from 'react-router';

import Role from '../static/Role';
import { Header } from './Header';

const options = {
  position: 'bottom left',
  timeout: 5000,
  offset: '10vh',
  type: 'info',
  transition: transitions.fade,
  containerStyle: {
    zIndex: 99999,
  },
};

interface Props {
  isLoggedIn: boolean;
  role: Role;
}

const HeaderFixture = ({ isLoggedIn, role }: Props) => {
  const alert = useAlert();
  return (
    <Header
      logIn={console.log}
      logOut={console.log}
      isLoggedIn={isLoggedIn}
      role={role}
      alert={alert}
    />
  );
};

export default () => {
  const [isLoggedIn] = useValue<boolean>('isLoggedIn', { defaultValue: false });
  const [role] = useSelect('role', {
    options: Object.values(Role),
    defaultValue: Role.LoggedOut,
  });

  return (
    <MemoryRouter>
      <Provider
        template={AlertTemplate}
        {...options}
        className="alert-provider-custom"
      >
        <HeaderFixture role={role} isLoggedIn={isLoggedIn} />
      </Provider>
    </MemoryRouter>
  );
};
