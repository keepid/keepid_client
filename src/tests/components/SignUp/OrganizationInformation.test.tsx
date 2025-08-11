// eslint-disable-next-line import/no-extraneous-dependencies

import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';

import OrganizationInformation from '../../../components/SignUp/pages/OrganizationInformation';
import SignUpContext, {
  defaultSignUpContextValue,
  OrganizationInformationProperties,
} from '../../../components/SignUp/SignUp.context';
import { onPropertyChange } from '../../../components/SignUp/SignUp.util';

const organizationInformation = {};

const setOrganizationInformation = jest.fn((key, val) => {
  organizationInformation[key] = val;
});

describe('Organization Information Page Tests', () => {
  beforeAll(() => {
    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
  });

  const organizationName = 'test org';
  const organizationWebsite = 'org@gmail.com';
  const organizationEIN = '00-0000000';
  const address = '1600 Pennsylvania Avenue';
  const city = 'Philadelphia';
  const state = 'PA';
  const zipcode = '19106';
  const phoneNumber = '(000)000-0000';
  const email = 'testorg@gmail.com';

  test('Successful setup', async () => {
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();
    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              organizationInformationContext: {
                values: organizationInformation as OrganizationInformationProperties,
                onPropertyChange: onPropertyChange(
                  organizationInformation,
                  setOrganizationInformation,
                ),
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
                moveToPreviousSignupStage: handlePrevious,
              },
            }}
          >
            <OrganizationInformation />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByLabelText('Organization Name'), { target: { value: organizationName } });
    fireEvent.change(screen.getByLabelText('Organization Website'), { target: { value: organizationWebsite } });
    fireEvent.change(screen.getByLabelText('Organization EIN'), { target: { value: organizationEIN } });
    fireEvent.change(screen.getByLabelText('Organization Address'), { target: { value: address } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: city } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: state } });
    fireEvent.change(screen.getByLabelText('Zipcode'), { target: { value: zipcode } });
    fireEvent.change(screen.getByLabelText('Organization Phone Number'), { target: { value: phoneNumber } });
    fireEvent.change(screen.getByLabelText('Organization Email Address'), { target: { value: email } });

    await waitFor(() => {
      expect(screen.getByDisplayValue(organizationName)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));

    // Assert
    await waitFor(() => {
      expect(setOrganizationInformation).toBeCalledTimes(9);
      expect(handleContinue).toBeCalledTimes(1);
      expect(handlePrevious).toBeCalledTimes(1);
    }, { timeout: 100 });
  });
  test('Invalid Fields', async () => {
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();
    render(
      <MemoryRouter>
        <IntlProvider locale="en">
          <SignUpContext.Provider
            value={{
              ...defaultSignUpContextValue,

              organizationInformationContext: {
                values: organizationInformation as OrganizationInformationProperties,
                onPropertyChange: onPropertyChange(
                  organizationInformation,
                  setOrganizationInformation,
                ),
              },

              signUpStageStateContext: {
                ...defaultSignUpContextValue.signUpStageStateContext,
                moveToNextSignupStage: handleContinue,
                moveToPreviousSignupStage: handlePrevious,
              },
            }}
          >
            <OrganizationInformation />
          </SignUpContext.Provider>
        </IntlProvider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.blur(screen.getByLabelText('Organization Name'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Organization Name cannot be blank')).toBeInTheDocument();
      expect(handleContinue).toBeCalledTimes(0);
    });
  });
});
