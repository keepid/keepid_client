import {
  cleanup, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { setupServer } from 'msw/node';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { MemoryRouter } from 'react-router-dom';

import { ReviewSubmit } from '../../../components/SignUp/pages/ReviewSubmit';

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

const server = setupServer();

describe('Review Submit Page Test', () => {
  const username = 'testOrg4';
  const password = 'password';
  const firstName = 'test';
  const lastName = 'org';
  const birthDate = new Date('February 19, 2021');
  const address = '1600 Pennsylvania Avenue';
  const city = 'Philadelphia';
  const state = 'PA';
  const zipcode = '19106';
  const phoneNumber = '(000)000-0000';
  const email = 'testorg@gmail.com';
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
  const handleChangeRecaptcha = jest.fn();
  const alertShowFn = jest.fn();
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    cleanup();
    server.resetHandlers();
  });
  afterAll(() => server.close());
  test('Successful setup', async () => {
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
          <ReviewSubmit
            username={username}
            password={password}
            firstname={firstName}
            lastname={lastName}
            birthDate={birthDate}
            address={address}
            city={city}
            state={state}
            zipcode={zipcode}
            phonenumber={phoneNumber}
            email={email}
            orgName={organizationName}
            orgWebsite={organizationWebsite}
            ein={organizationEIN}
            orgAddress={orgaddress}
            orgCity={orgcity}
            orgState={orgstate}
            orgZipcode={orgzipcode}
            orgPhoneNumber={orgphoneNumber}
            orgEmail={orgemail}
            handleSubmit={handleSubmit}
            handlePrevious={handlePrevious}
            handleFormJumpTo={handleFormJumpTo}
            alert={{
              show: alertShowFn,
            }}
            handleChangeRecaptcha={handleChangeRecaptcha}
            buttonState=""
          />
        </Provider>
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
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
          <ReviewSubmit
            username={username}
            password={password}
            firstname={firstName}
            lastname={lastName}
            birthDate={birthDate}
            address={address}
            city={city}
            state={state}
            zipcode={zipcode}
            phonenumber={phoneNumber}
            email={email}
            orgName={organizationName}
            orgWebsite={organizationWebsite}
            ein={organizationEIN}
            orgAddress={orgaddress}
            orgCity={orgcity}
            orgState={orgstate}
            orgZipcode={orgzipcode}
            orgPhoneNumber={orgphoneNumber}
            orgEmail={orgemail}
            handleSubmit={handleSubmit}
            handlePrevious={handlePrevious}
            handleFormJumpTo={handleFormJumpTo}
            alert={{
              show: alertShowFn,
            }}
            handleChangeRecaptcha={handleChangeRecaptcha}
            buttonState=""
          />
        </Provider>
      </MemoryRouter>,
    );

    // Act
    const allEdits = screen.getAllByText('Edit');
    for (let i = 0; i < allEdits.length; i += 1) {
      fireEvent.click(allEdits[i]);
    }
    await waitFor(() => {
      expect(handleFormJumpTo).toBeCalledTimes(3);
    });
  });
});
