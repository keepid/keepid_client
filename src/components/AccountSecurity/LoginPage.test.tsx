import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';
import { LoginPage } from './LoginPage';
import Role from '../../static/Role';
import getServerURL from '../../serverOverride';

const server = setupServer();

describe('LognPage', () => {
  const authSuccessResponseBody = {
    status: 'AUTH_SUCCESS',
    userRole: 'Admin',
    organization: 'Test Organization',
    firstName: 'Bilbo',
    lastName: 'Baggins',
  };
  const authFailureResponseBody = { status: 'AUTH_FAILURE' };

  const username = 'bilbo_baggins';
  const password = 'p@ssW0rd';
  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => server.use(
    rest.post(`${getServerURL()}/login`, (req, res, ctx) => {
      const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.username === username && reqBody.password === password) {
        return res(ctx.json(authSuccessResponseBody));
      }
      return res(ctx.json(authFailureResponseBody));
    }),
  ));
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());

  test('should login properly', async () => {
    // Arrange
    const loginFn = jest.fn();

    render(
      <MemoryRouter>
        <LoginPage
          useRecaptcha={false}
          logIn={loginFn}
          isLoggedIn={false}
          alert={{
            show: jest.fn(),
          }}
          autoLogout={false}
          logOut={jest.fn()}
          role={Role.LoggedOut}
          setAutoLogout={jest.fn()}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: username } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    // Assert
    await waitFor(() => {
      expect(loginFn).toBeCalledTimes(1);
    });

    expect(loginFn).toBeCalledWith(Role.Admin, username, authSuccessResponseBody.organization, `${authSuccessResponseBody.firstName} ${authSuccessResponseBody.lastName}`);
  });

  test('should handle invalid login properly', async () => {
    // Arrange
    const loginFn = jest.fn();
    const alertShowFn = jest.fn();
    render(
      <MemoryRouter>
        <LoginPage
          useRecaptcha={false}
          logIn={loginFn}
          isLoggedIn={false}
          alert={{ show: alertShowFn }}
          autoLogout={false}
          logOut={jest.fn()}
          role={Role.LoggedOut}
          setAutoLogout={jest.fn()}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: username } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'the incorrect password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    // Assert
    await waitFor(() => {
      expect(alertShowFn).toBeCalledTimes(1);
    });

    expect(loginFn).toBeCalledTimes(0);
    expect(alertShowFn).toBeCalledWith('Incorrect Username or Password');
  });
});
