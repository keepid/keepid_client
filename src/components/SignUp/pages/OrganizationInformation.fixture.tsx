import React, { useState } from 'react';
import { Provider, transitions, useAlert } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
import { Form } from 'react-bootstrap';
import { useValue } from 'react-cosmos/fixture';
import { IntlProvider } from 'react-intl';

import OrganizationInformation from './OrganizationInformation';

interface BaseInputFixtureProps {
  fixture: (props: any) => JSX.Element;
  type: string;
  otherProps?: object | undefined;
}

const OrganizationInformationFixture = () => {
  const [orgName, setOrgName] = useValue<string>('orgName', {
    defaultValue: '',
  });
  const [orgWebsite, setOrgWebsite] = useValue<string>('orgWebsite', {
    defaultValue: '',
  });

  const [ein, setOrgEin] = useValue<string>('ein', { defaultValue: '' });
  const [orgAddress, setAddress] = useValue<string>('orgAddress', {
    defaultValue: '123 Main St.',
  });
  const [orgCity, setCity] = useValue<string>('orgCity', {
    defaultValue: '',
  });
  const [orgState, setState] = useValue<string>('orgState', {
    defaultValue: '',
  });
  const [orgZipcode, setZipcode] = useValue<string>('orgZipcode', {
    defaultValue: '',
  });
  const [orgPhoneNumber, setPhoneNumber] = useValue<string>('orgPhoneNumber', {
    defaultValue: '',
  });
  const [orgEmail, setEmail] = useValue<string>('orgEmail', {
    defaultValue: '',
  });

  const organizationInformation = {
    orgName,
    orgWebsite,
    ein,
    orgAddress,
    orgCity,
    orgState,
    orgZipcode,
    orgPhoneNumber,
    orgEmail,
  };

  return (
    <IntlProvider locale="en">
      <Provider template={AlertTemplate} className="alert-provider-custom">
        <OrganizationInformation
          orgName={orgName}
          lastname={orgWebsite}
          ein={ein}
          orgAddress={orgAddress}
          orgCity={orgCity}
          orgState={orgState}
          orgZipcode={orgZipcode}
          orgPhoneNumber={orgPhoneNumber}
          orgEmail={orgEmail}
          onChangeOrgName={(e) => setOrgName(e.target.value)}
          onChangeOrgWebsite={(e) => setOrgWebsite(e.target.value)}
          onChangeOrgEIN={(e) => setOrgEin(e.target.value)}
          onChangeOrgAddress={(e) => setAddress(e.target.value)}
          onChangeOrgCity={(e) => setCity(e.target.value)}
          onChangeOrgState={(e) => setState(e.target.value)}
          onChangeOrgZipcode={(e) => setZipcode(e.target.value)}
          onChangeOrgPhoneNumber={(e) => setPhoneNumber(e.target.value)}
          onChangeOrgEmail={(e) => setEmail(e.target.value)}
          handleContinue={() => {
            console.log(organizationInformation);
          }}
          handlePrevious={() => {}}
        />
      </Provider>
    </IntlProvider>
  );
};

export default OrganizationInformationFixture;
