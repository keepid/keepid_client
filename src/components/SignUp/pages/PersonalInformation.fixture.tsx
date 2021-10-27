import React, { useState } from 'react';
import { Provider, transitions, useAlert } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { Form } from 'react-bootstrap';
import { useValue } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';

import PersonalInformation from './PersonalInformation';

interface BaseInputFixtureProps {
  fixture: (props: any) => JSX.Element;
  type: string;
  otherProps?: object | undefined;
}

const PersonalInformationFixture = () => {
  const [firstName, setFirstName] = useValue<string>('firstName', {
    defaultValue: 'John',
  });
  const [lastName, setLastName] = useValue<string>('lastName', {
    defaultValue: 'Doe',
  });
  // @ts-ignore
  const [birthDate, setBirthDate] = useValue<Date>('birthDate', {
    defaultValue: new Date('02-03-2001'),
  });
  const [address, setAddress] = useValue<string>('address', {
    defaultValue: '123 Main St.',
  });
  const [city, setCity] = useValue<string>('city', {
    defaultValue: 'New York City',
  });
  const [state, setState] = useValue<string>('state', { defaultValue: 'NY' });
  const [zipcode, setZipcode] = useValue<string>('zipcode', {
    defaultValue: '12345',
  });
  const [phoneNumber, setPhoneNumber] = useValue<string>('phoneNumber', {
    defaultValue: '(234)567-8910',
  });
  const [email, setEmail] = useValue<string>('email', {
    defaultValue: 'test@example.com',
  });

  const personalInformation = {
    firstName,
    lastName,
    birthDate,
    address,
    city,
    state,
    zipcode,
    phoneNumber,
    email,
  };

  return (
    <IntlProvider locale="en">
      <Provider template={AlertTemplate} className="alert-provider-custom">
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
          onChangeFirstname={(e) => setFirstName(e.target.value)}
          onChangeLastname={(e) => setLastName(e.target.value)}
          onChangeBirthDate={(date) => setBirthDate(date)}
          onChangeAddress={(e) => setAddress(e.target.value)}
          onChangeCity={(e) => setCity(e.target.value)}
          onChangeState={(e) => setState(e.target.value)}
          onChangeZipcode={(e) => setZipcode(e.target.value)}
          onChangePhoneNumber={(e) => setPhoneNumber(e.target.value)}
          onChangeEmail={(e) => setEmail(e.target.value)}
          handleContinue={() => { console.log(personalInformation); }}
          handlePrevious={() => {}}
        />
      </Provider>
    </IntlProvider>
  );
};

export default PersonalInformationFixture;
