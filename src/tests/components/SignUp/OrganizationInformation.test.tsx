import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { MemoryRouter } from 'react-router-dom';

import { OrganizationInformation } from '../../../components/SignUp/pages/OrganizationInformation';

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

describe('Organization Information Page Tests', () => {
  const organizationName = 'test org';
  const organizationWebsite = 'org@gmail.com';
  const organizationEIN = '00-0000000';
  const address = '1600 Pennsylvania Avenue';
  const city = 'Philadelphia';
  const state = 'PA';
  const zipcode = '19106';
  const phoneNumber = '(000)000-0000';
  const email = 'testorg@gmail.com';
  const alertShowFn = jest.fn();
  test('Successful setup', async () => {
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();

    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
          <OrganizationInformation
            orgName={organizationName}
            orgWebsite={organizationWebsite}
            ein={organizationEIN}
            orgAddress={address}
            orgCity={city}
            orgState={state}
            orgZipcode={zipcode}
            orgPhoneNumber={phoneNumber}
            orgEmail={email}
            onChangeOrgName={jest.fn()}
            onChangeOrgWebsite={jest.fn()}
            onChangeOrgEIN={jest.fn()}
            onChangeOrgAddress={jest.fn()}
            onChangeOrgCity={jest.fn()}
            onChangeOrgState={jest.fn()}
            onChangeOrgZipcode={jest.fn()}
            onChangeOrgPhoneNumber={jest.fn()}
            onChangeOrgEmail={jest.fn()}
            handlePrevious={handlePrevious}
            handleContinue={handleContinue}
            alert={{
              show: alertShowFn,
            }}
          />
        </Provider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByLabelText('Organization name'), { target: { value: organizationName } });
    fireEvent.change(screen.getByLabelText('Organization website'), { target: { value: organizationWebsite } });
    fireEvent.change(screen.getByLabelText('Organization EIN'), { target: { value: organizationEIN } });
    fireEvent.change(screen.getByLabelText('Street Address'), { target: { value: address } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: city } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: state } });
    fireEvent.change(screen.getByLabelText('Zipcode'), { target: { value: zipcode } });
    fireEvent.change(screen.getByLabelText('Organization Phone number'), { target: { value: phoneNumber } });
    fireEvent.change(screen.getByLabelText('Organization email address'), { target: { value: email } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
      expect(handlePrevious).toBeCalledTimes(1);
    });
  });
  test('Invalid Fields', async () => {
    const organizationName = '';
    const organizationWebsite = '';
    const organizationEIN = '';
    const address = '';
    const city = '';
    const state = '';
    const zipcode = '';
    const phoneNumber = '';
    const email = '';
    const handleContinue = jest.fn();
    const handlePrevious = jest.fn();
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
          <OrganizationInformation
            orgName={organizationName}
            orgWebsite={organizationWebsite}
            ein={organizationEIN}
            orgAddress={address}
            orgCity={city}
            orgState={state}
            orgZipcode={zipcode}
            orgPhoneNumber={phoneNumber}
            orgEmail={email}
            onChangeOrgName={jest.fn()}
            onChangeOrgWebsite={jest.fn()}
            onChangeOrgEIN={jest.fn()}
            onChangeOrgAddress={jest.fn()}
            onChangeOrgCity={jest.fn()}
            onChangeOrgState={jest.fn()}
            onChangeOrgZipcode={jest.fn()}
            onChangeOrgPhoneNumber={jest.fn()}
            onChangeOrgEmail={jest.fn()}
            handlePrevious={handlePrevious}
            handleContinue={handleContinue}
            alert={{
              show: alertShowFn,
            }}
          />
        </Provider>
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const allInvalidTexts = screen.getAllByText('Invalid or Blank field.');
    expect(allInvalidTexts.length).toEqual(9);
    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(0);
      expect(alertShowFn).toBeCalledTimes(1);
    });
    expect(alertShowFn).toBeCalledWith('One or more fields are invalid');
  });
});
