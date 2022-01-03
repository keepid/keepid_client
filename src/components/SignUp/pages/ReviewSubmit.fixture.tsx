import React, { useState } from 'react';

import BaseSignupFixture from '../BaseSignupFixture';
import {
  AccountInformationProperties,
  OrganizationInformationProperties,
} from '../SignUp.context';
import ReviewSubmit, { ReviewSubmitV2 } from './ReviewSubmit';

const ReviewSubmitFixture = () => {
  const [
    accountInformation,
    setAccountInformation,
  ] = useState<AccountInformationProperties>({
    confirmPassword: 'p@S$w0rd',
    password: 'p@S$w0rd',
    username: 'john_doe_123',
    firstname: 'John',
    lastname: 'Doe',
    birthDate: new Date('01-01-1980'),
    // email: 'test@example.com',
  });
  const [
    organizationInformation,
    setOrganizationInformation,
  ] = useState<OrganizationInformationProperties>({
    ein: '',
    orgAddress: '',
    orgCity: '',
    orgEmail: '',
    orgName: '',
    orgPhoneNumber: '',
    orgState: '',
    orgWebsite: '',
    orgZipcode: '',
  });

  return (
    <BaseSignupFixture
      v1Component={(
        <ReviewSubmit
          username={accountInformation.username}
          password={accountInformation.password}
          firstname={accountInformation.firstname}
          lastname={accountInformation.lastname}
          birthDate={accountInformation.birthDate}
          // address={accountInformation.address}
          // city={accountInformation.city}
          // state={accountInformation.state}
          // zipcode={accountInformation.zipcode}
          // phonenumber={accountInformation.phoneNumber}
          // email={accountInformation.email}
          orgName={organizationInformation.orgName}
          orgWebsite={organizationInformation.orgWebsite}
          ein={organizationInformation.ein}
          orgAddress={organizationInformation.orgAddress}
          orgCity={organizationInformation.orgCity}
          orgState={organizationInformation.orgState}
          orgZipcode={organizationInformation.orgZipcode}
          orgPhoneNumber={organizationInformation.orgPhoneNumber}
          orgEmail={organizationInformation.orgEmail}
          handleSubmit={() => console.log('submit')}
          handlePrevious={() => console.log('previous')}
          handleFormJumpTo={(val) => console.log(`jump to: ${val}`)}
          // handleChangeRecaptcha={handleChangeRecaptcha}
          buttonState=""
        />
      )}
      v2Component={<ReviewSubmitV2 onSubmit={console.log} />}
    />
  );
};

export default ReviewSubmitFixture;
