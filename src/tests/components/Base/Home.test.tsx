import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import Home from '../../../components/Home/index';
import Role from '../../../static/Role';

window.scroll = jest.fn();

const homeProps = {
  logIn: jest.fn(),
  logOut: jest.fn(),
  role: Role.LoggedOut,
  autoLogout: false,
  setAutoLogout: jest.fn(),
};

test('Home page loads', () => {
  const { getByText } = render(
    <MemoryRouter>
      <Provider template={AlertTemplate}>
        <IntlProvider locale="en" defaultLocale="en">
          <Home {...homeProps} />
        </IntlProvider>
      </Provider>
    </MemoryRouter>,
  );
  getByText('An Identification Platform');
});

test('Home page renders embedded auth card', () => {
  const { getByText } = render(
    <MemoryRouter>
      <Provider template={AlertTemplate}>
        <IntlProvider locale="en" defaultLocale="en">
          <Home {...homeProps} />
        </IntlProvider>
      </Provider>
    </MemoryRouter>,
  );
  getByText('No Google account? Sign in with email and password');
  getByText('Sign Up with Us');
});

test('Home page snapshot test', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <Provider template={AlertTemplate}>
          <IntlProvider locale="en" defaultLocale="en">
            <Home {...homeProps} />
          </IntlProvider>
        </Provider>
      </MemoryRouter>,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
