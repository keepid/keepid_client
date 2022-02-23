// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import AccountSetup from '../../../components/SignUp/pages/AccountSetup';
import SignUpContext, {
  AccountInformationProperties,
  defaultSignUpContextValue,
} from '../../../components/SignUp/SignUp.context';
import { onPropertyChange } from '../../../components/SignUp/SignUp.util';
import getServerURL from '../../../serverOverride';

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
  const firstName = 'John';
  const lastName = 'Doe';
  const birthDate = '01/01/2000';

  let accountInformation = {};
  const setAccountInformation = jest.fn((key, val) => {
    accountInformation[key] = val;
  });

  beforeAll(() => {
    server.listen();

    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
  });
  beforeEach(() =>
    server.use(
      rest.post(`${getServerURL()}/username-exists`, (req, res, ctx) => {
        const reqBody =
          typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (reqBody.username === username) {
          return res(ctx.json(validUsernameSuccess));
        }
        return res(ctx.json(invalidUsername));
      }),
    ));
  afterEach(() => {
    accountInformation = {};
    setAccountInformation.mockClear();
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());
  test('Successful setup', async () => {
    const handleContinue = jest.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                values: accountInformation as AccountInformationProperties,
                onPropertyChange: onPropertyChange(
                  accountInformation,
                  setAccountInformation,
                ),
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
              },
            }}
          >
            <AccountSetup />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: firstName },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: lastName },
    });
    fireEvent.change(screen.getByPlaceholderText('Birth Date'), {
      target: { value: birthDate },
    });
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: username },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: password },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: password },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
      expect(setAccountInformation).toBeCalledTimes(6);
    });
  });

  test('Password and Confirm Password do not match', async () => {
    const username = 'testOrg4';
    const password = 'password';
    const confirmPassword = 'notthesamepassword';
    const handleContinue = jest.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                values: {
                  ...accountInformation,
                  username,
                  password,
                  confirmPassword,
                } as AccountInformationProperties,
                onPropertyChange: onPropertyChange(
                  accountInformation,
                  setAccountInformation,
                ),
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
              },
            }}
          >
            <AccountSetup />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.blur(screen.getByPlaceholderText('Confirm Password'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    expect(handleContinue).toBeCalledTimes(0);
  });

  test('Invalid username', async () => {
    const username = 'testOrg4@gmail.com';
    const password = 'password';
    const confirmPassword = 'password';
    const handleContinue = jest.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                values: {
                  ...accountInformation,
                  username,
                  password,
                  confirmPassword,
                } as AccountInformationProperties,
                onPropertyChange: onPropertyChange(
                  accountInformation,
                  setAccountInformation,
                ),
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
              },
            }}
          >
            <AccountSetup />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.blur(screen.getByPlaceholderText('Username'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Invalid Username')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(handleContinue).toBeCalledTimes(0);
  });
  test('Taken username', async () => {
    const username = 'testOrg';
    const password = 'password';
    const confirmPassword = 'password';
    const handleContinue = jest.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                values: {
                  ...accountInformation,
                  username,
                  password,
                  confirmPassword,
                } as AccountInformationProperties,
                onPropertyChange: onPropertyChange(
                  accountInformation,
                  setAccountInformation,
                ),
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
              },
            }}
          >
            <AccountSetup />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.blur(screen.getByPlaceholderText('Username'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Username already taken')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(handleContinue).toBeCalledTimes(0);
  });
});
