import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import ReviewSubmit from '../../../components/SignUp/pages/ReviewSubmit';
import SignUpContext, {
  defaultSignUpContextValue,
  SignupStage,
} from '../../../components/SignUp/SignUp.context';

describe('Review Submit Page Test', () => {
  const username = 'testOrg4';
  const password = 'password';
  const firstname = 'test';
  const lastname = 'org';
  const birthDate = new Date('February 19, 2021');
  const organizationName = 'test org';
  const organizationWebsite = 'org@gmail.com';
  const organizationEIN = '00-0000000';
  const orgaddress = '1600 Pennsylvania Avenue';
  const orgcity = 'Philadelphia';
  const orgstate = 'PA';
  const orgzipcode = '19106';
  const orgphoneNumber = '(000)000-0000';
  const orgemail = 'testorg@gmail.com';
  const handleSubmit = jest.fn();
  const handlePrevious = jest.fn();
  const handleFormJumpTo = jest.fn();

  beforeAll(() => {
    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
  });

  test('Successful setup', async () => {
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                ...defaultSignUpContextValue.accountInformationContext,
                values: {
                  firstname,
                  lastname,
                  username,
                  birthDate,
                  password,
                  confirmPassword: password,
                },
              },

              organizationInformationContext: {
                ...defaultSignUpContextValue.organizationInformationContext,
                values: {
                  orgName: organizationName,
                  orgWebsite: organizationWebsite,
                  ein: organizationEIN,
                  orgAddress: orgaddress,
                  orgCity: orgcity,
                  orgState: orgstate,
                  orgZipcode: orgzipcode,
                  orgPhoneNumber: orgphoneNumber,
                  orgEmail: orgemail,
                },
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToPreviousSignupStage: handlePrevious,
              },
            }}
          >
            <ReviewSubmit onSubmit={handleSubmit} />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));

    await waitFor(() => {
      expect(handlePrevious).toBeCalledTimes(1);
    });
  });
  test('Test Jump To Form', async () => {
    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                ...defaultSignUpContextValue.accountInformationContext,
                values: {
                  firstname,
                  lastname,
                  username,
                  birthDate,
                  password,
                  confirmPassword: password,
                },
              },

              organizationInformationContext: {
                ...defaultSignUpContextValue.organizationInformationContext,
                values: {
                  orgName: organizationName,
                  orgWebsite: organizationWebsite,
                  ein: organizationEIN,
                  orgAddress: orgaddress,
                  orgCity: orgcity,
                  orgState: orgstate,
                  orgZipcode: orgzipcode,
                  orgPhoneNumber: orgphoneNumber,
                  orgEmail: orgemail,
                },
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                stages: [
                  SignupStage.ACCOUNT_INFORMATION,
                  SignupStage.ORGANIZATION_INFORMATION,
                  SignupStage.SIGN_USER_AGREEMENT,
                  SignupStage.REVIEW_SUBMIT,
                ],
                currentStage: SignupStage.REVIEW_SUBMIT,
                moveToPreviousSignupStage: handlePrevious,
                moveToSignupStage: handleFormJumpTo,
              },
            }}
          >
            <ReviewSubmit onSubmit={handleSubmit} />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    const allEdits = screen.getAllByText('Edit');
    for (let i = 0; i < allEdits.length; i += 1) {
      fireEvent.click(allEdits[i]);
    }
    await waitFor(() => {
      expect(handleFormJumpTo).toBeCalledTimes(2);
    });
  });

  test('Test Jump To Form without Organization Information', async () => {
    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              accountInformationContext: {
                ...defaultSignUpContextValue.accountInformationContext,
                values: {
                  firstname,
                  lastname,
                  username,
                  birthDate,
                  password,
                  confirmPassword: password,
                },
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                stages: [
                  SignupStage.ACCOUNT_INFORMATION,
                  SignupStage.SIGN_USER_AGREEMENT,
                  SignupStage.REVIEW_SUBMIT,
                ],
                currentStage: SignupStage.REVIEW_SUBMIT,
                moveToPreviousSignupStage: handlePrevious,
                moveToSignupStage: handleFormJumpTo,
              },
            }}
          >
            <ReviewSubmit onSubmit={handleSubmit} />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    const allEdits = screen.getAllByText('Edit');
    for (let i = 0; i < allEdits.length; i += 1) {
      fireEvent.click(allEdits[i]);
    }
    await waitFor(() => {
      expect(handleFormJumpTo).toBeCalledTimes(1);
    });
  });
});
