import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { MemoryRouter } from 'react-router-dom';

import { PersonalInformation } from '../../../components/SignUp/pages/PersonalInformation';

describe('Personal Information Page Tests', () => {
  const firstName = 'test';
  const lastName = 'org';
  const birthDate = new Date('February 19, 2021');
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
        <PersonalInformation
          firstname={firstName}
          lastname={lastName}
          birthDate={birthDate}
          address={address}
          city={city}
          state={state}
          zipcode={zipcode}
          phonenumber={phoneNumber}
          email={email}
          onChangeFirstname={jest.fn()}
          onChangeLastname={jest.fn()}
          onChangeBirthDate={jest.fn()}
          onChangeAddress={jest.fn()}
          onChangeCity={jest.fn()}
          onChangeState={jest.fn()}
          onChangeZipcode={jest.fn()}
          onChangePhoneNumber={jest.fn()}
          onChangeEmail={jest.fn()}
          handlePrevious={handlePrevious}
          handleContinue={handleContinue}
          alert={{
            show: alertShowFn,
          }}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: firstName } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: lastName } });
    fireEvent.change(screen.getByLabelText('Birth Date'), { target: { value: birthDate } });
    fireEvent.change(screen.getByPlaceholderText('Street Address'), { target: { value: address } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: city } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: state } });
    fireEvent.change(screen.getByPlaceholderText('Zipcode'), { target: { value: zipcode } });
    fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: phoneNumber } });
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: email } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous Step' }));

    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(1);
      expect(handlePrevious).toBeCalledTimes(1);
    });
  });
  test('All Invalid Fields', async () => {
    const firstName = '';
    const lastName = '';
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
        <PersonalInformation
          firstname={firstName}
          lastname={lastName}
          birthDate={birthDate}
          address={address}
          city={city}
          state={state}
          zipcode={zipcode}
          phonenumber={phoneNumber}
          email={email}
          onChangeFirstname={jest.fn()}
          onChangeLastname={jest.fn()}
          onChangeBirthDate={jest.fn()}
          onChangeAddress={jest.fn()}
          onChangeCity={jest.fn()}
          onChangeState={jest.fn()}
          onChangeZipcode={jest.fn()}
          onChangePhoneNumber={jest.fn()}
          onChangeEmail={jest.fn()}
          handlePrevious={handlePrevious}
          handleContinue={handleContinue}
          alert={{
            show: alertShowFn,
          }}
        />
      </MemoryRouter>,
    );

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const allInvalidTexts = screen.getAllByText('Invalid or Blank field.');
    // Expect 8 Blank Fields
    expect(allInvalidTexts.length).toEqual(8);
    // Assert
    await waitFor(() => {
      expect(handleContinue).toBeCalledTimes(0);
      expect(alertShowFn).toBeCalledTimes(1);
    });
    expect(alertShowFn).toBeCalledWith('One or more fields are invalid');
  });
});
