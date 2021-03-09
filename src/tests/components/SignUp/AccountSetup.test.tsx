import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AccountSetup } from '../../../components/SignUp/pages/AccountSetup';
import getServerURL from '../../../serverOverride';
import Role from '../../../static/Role';

const server = setupServer();

describe('Account Setup Page Test', () => {
  const validUsernameSuccess = {
    status: 'SUCCESS',
  };
  const invalidUsername = {
    status: 'USERNAME_ALREADY_EXISTS',
  };
  const username = 'testOrg4';
  const password = 'password';
  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => server.use(
    rest.post(`${getServerURL()}/username-exists`, (req, res, ctx) => {
      const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (reqBody.username === username) {
        return res(ctx.json(validUsernameSuccess));
      }
      return res(ctx.json(invalidUsername));
    }),
  ));
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());
  test('Successful setup', async () => {
    const handleContinue = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <AccountSetup
          username={username}
          password={password}
          confirmPassword={password}
          onChangeUsername={jest.fn()}
          onChangePassword={jest.fn()}
          onChangeConfirmPassword={jest.fn()}
          handleContinue={handleContinue}
          alert={{
            show: jest.fn(),
          }}
          role={Role.LoggedOut}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: username } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: password } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
    });
  });

  test('Password and Confirm Password do not match', async () => {
    const username = 'testOrg4';
    const password = 'password';
    const confirmPassword = 'notthesamepassword';
    const handleContinue = jest.fn();
    const alertShowFn = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <AccountSetup
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onChangeUsername={jest.fn()}
          onChangePassword={jest.fn()}
          onChangeConfirmPassword={jest.fn()}
          handleContinue={handleContinue}
          alert={{
            show: alertShowFn,
          }}
          role={Role.LoggedOut}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.change(screen.getByText('Passwords do not match.'));
    // Assert
    await waitFor(() => {
      expect(alertShowFn).toBeCalledTimes(1);
      expect(handleContinue).toBeCalledTimes(0);
    });
    expect(alertShowFn).toBeCalledWith('One or more fields are invalid');
  });

  test('Invalid username', async () => {
    const username = 'testOrg4@gmail.com';
    const password = 'password';
    const confirmPassword = 'password';
    const handleContinue = jest.fn();
    const alertShowFn = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <AccountSetup
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onChangeUsername={jest.fn()}
          onChangePassword={jest.fn()}
          onChangeConfirmPassword={jest.fn()}
          handleContinue={handleContinue}
          alert={{
            show: alertShowFn,
          }}
          role={Role.LoggedOut}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    // Assert
    await waitFor(() => {
      expect(alertShowFn).toBeCalledTimes(1);
      expect(handleContinue).toBeCalledTimes(0);
    });
    fireEvent.change(screen.getByText('Invalid or taken username.'));
    expect(alertShowFn).toBeCalledWith('One or more fields are invalid');
  });
  test('Taken username', async () => {
    const username = 'testOrg';
    const password = 'password';
    const confirmPassword = 'password';
    const handleContinue = jest.fn();
    const alertShowFn = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <AccountSetup
          username={username}
          password={password}
          confirmPassword={confirmPassword}
          onChangeUsername={jest.fn()}
          onChangePassword={jest.fn()}
          onChangeConfirmPassword={jest.fn()}
          handleContinue={handleContinue}
          alert={{
            show: alertShowFn,
          }}
          role={Role.LoggedOut}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    // Assert
    await waitFor(() => {
      expect(alertShowFn).toBeCalledTimes(1);
      expect(handleContinue).toBeCalledTimes(0);
    });
    fireEvent.change(screen.getByText('Invalid or taken username.'));
    expect(alertShowFn).toBeCalledWith('One or more fields are invalid');
  });
});
