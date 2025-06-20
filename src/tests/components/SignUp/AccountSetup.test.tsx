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
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import AccountSetup from '../../../components/SignUp/pages/AccountSetup';
import SignUpContext, {
  AccountInformationProperties,
  defaultSignUpContextValue,
} from '../../../components/SignUp/SignUp.context';
import { onPropertyChange } from '../../../components/SignUp/SignUp.util';
import getServerURL from '../../../serverOverride';

const server = setupServer();

describe('Account Setup Page Test', () => {
  const validUsernameSuccess = { status: 'SUCCESS' };
  const invalidUsername = { status: 'USERNAME_ALREADY_EXISTS' };
  const username = 'testOrg4';

  beforeAll(() => {
    server.listen();

    // @ts-ignore
    global.window.matchMedia = vi.fn(() => ({
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    global.window.scrollTo = vi.fn();
  });

  beforeEach(() => {
    server.use(
      rest.post(`${getServerURL()}/username-exists`, (req, res, ctx) => {
        const reqBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (reqBody.username === username) {
          return res(ctx.json(validUsernameSuccess));
        }
        return res(ctx.json(invalidUsername));
      }),
    );
  });

  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  test('Successful setup', async () => {
    const accountInformation: Record<string, any> = {};
    const setAccountInformation = vi.fn((key: string, val: any) => {
      accountInformation[key] = val;
    });
    const handleContinue = vi.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,
              accountInformationContext: {
                values: accountInformation as AccountInformationProperties,
                onPropertyChange: onPropertyChange(accountInformation, setAccountInformation),
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

    fireEvent.change(screen.getByPlaceholderText('First Name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Birth Date'), {
      target: { value: '01/01/2000' },
    });
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: username },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
      expect(setAccountInformation).toBeCalledTimes(6);
    });
  });

  test('Password and Confirm Password do not match', async () => {
    const accountInformation: Record<string, any> = {};
    const setAccountInformation = vi.fn((key: string, val: any) => {
      accountInformation[key] = val;
    });
    const handleContinue = vi.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,
              accountInformationContext: {
                values: {
                  ...accountInformation,
                  username: 'testOrg4',
                  password: 'password',
                  confirmPassword: 'notthesamepassword',
                } as AccountInformationProperties,
                onPropertyChange: onPropertyChange(accountInformation, setAccountInformation),
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

    fireEvent.blur(screen.getByPlaceholderText('Confirm Password'));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(handleContinue).toBeCalledTimes(0);
  });

  test('Invalid username', async () => {
    const accountInformation: Record<string, any> = {};
    const setAccountInformation = vi.fn((key: string, val: any) => {
      accountInformation[key] = val;
    });
    const handleContinue = vi.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,
              accountInformationContext: {
                values: {
                  ...accountInformation,
                  username: 'testOrg4@gmail.com',
                  password: 'password',
                  confirmPassword: 'password',
                } as AccountInformationProperties,
                onPropertyChange: onPropertyChange(accountInformation, setAccountInformation),
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

    fireEvent.blur(screen.getByPlaceholderText('Username'));

    await waitFor(() => {
      expect(screen.getByText('Invalid Username')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(handleContinue).toBeCalledTimes(0);
  });

  test('Taken username', async () => {
    const accountInformation: Record<string, any> = {};
    const setAccountInformation = vi.fn((key: string, val: any) => {
      accountInformation[key] = val;
    });
    const handleContinue = vi.fn();

    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,
              accountInformationContext: {
                values: {
                  ...accountInformation,
                  username: 'testOrg',
                  password: 'password',
                  confirmPassword: 'password',
                } as AccountInformationProperties,
                onPropertyChange: onPropertyChange(accountInformation, setAccountInformation),
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

    fireEvent.blur(screen.getByPlaceholderText('Username'));

    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(handleContinue).toBeCalledTimes(0);
  });
});
