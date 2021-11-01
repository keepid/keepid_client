import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { Steps } from 'antd';
import React, { Component, useEffect, useState } from 'react';
import { withAlert } from 'react-alert';
import { ProgressBar } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import USStates from '../../static/data/states_titlecase.json';
import Role from '../../static/Role';
import AccountSetup from './pages/AccountSetup';
import OrganizationInformation from './pages/OrganizationInformation';
import PersonalInformation from './pages/PersonalInformation';
import ReviewSubmit from './pages/ReviewSubmit';
import SignUserAgreement from './pages/SignUserAgreement';

const { Step } = Steps;
const urlPattern: RegExp = new RegExp(
  '^(http:www.)|(https:www.)|(http:(.*)|https:)(.*)$',
);

interface Props {
  alert: any;
  role: Role;
}

interface State {
  signupStage: number;
  username: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  organizationWebsite: string;
  organizationEIN: string;
  organizationAddressStreet: string;
  organizationAddressCity: string;
  organizationAddressState: string;
  organizationAddressZipcode: string;
  organizationEmail: string;
  organizationPhoneNumber: string;
  firstname: string;
  lastname: string;
  birthDate: Date;
  email: string;
  phonenumber: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  hasSigned: boolean;
  canvasDataUrl: string;
  recaptchaPayload: string;
  buttonState: string;
  redirectLogin: boolean;
}

export const addHttp = (url: string) => {
  if (!urlPattern.test(url)) {
    return `http://${url}`;
  }
  return url;
};

export const birthDateStringConverter = (birthDate: Date) => {
  const personBirthMonth = birthDate.getMonth() + 1;
  const personBirthMonthString =
    personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth;
  const personBirthDay = birthDate.getDate();
  const personBirthDayString =
    personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay;
  const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
  return personBirthDateFormatted;
};

const CompleteSignupFlow: React.FC<Props> = (props) => {
  const [signupStage, setSignupStage] = useState(0);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationWebsite, setOrganizationWebsite] = useState('');
  const [organizationEIN, setOrganizationEIN] = useState('');
  const [organizationAddressStreet, setOrganizationAddressStreet] = useState('');
  const [organizationAddressCity, setOrganizationAddressCity] = useState('');
  const [organizationAddressState, setOrganizationAddressState] = useState(USStates[0].abbreviation);
  const [organizationAddressZipcode, setOrganizationAddressZipcode] = useState('');
  const [organizationEmail, setOrganizationEmail] = useState('');
  const [organizationPhoneNumber, setOrganizationPhoneNumber] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [email, setEmail] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasSigned, setHasSigned] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [recaptchaPayload, setRecaptchaPayload] = useState('');
  const [buttonState, setButtonState] = useState('');
  const [redirectLogin, setRedirectLogin] = useState(false);

  /**
   * Returns a function that can be used as an onChange callback
   * @param setStateFn - the function to call with the event.target.value onChange
   * @return Function - the function to pass as the onChange handler
   */
  const stateUpdateWrapper = (setStateFn) => ({ target: { value } }) => setStateFn(value);

  const handleFormSubmit = (): void => {
    const { alert } = props;
    const birthDateString = birthDateStringConverter(birthDate);
    const revisedURL = addHttp(organizationWebsite);

    // submit organization and director information
    fetch(`${getServerURL()}/organization-signup`, {
      method: 'POST',
      body: JSON.stringify({
        organizationWebsite: revisedURL,
        organizationName,
        organizationEIN,
        organizationAddressStreet,
        organizationAddressCity,
        organizationAddressState,
        organizationAddressZipcode,
        organizationEmail,
        organizationPhoneNumber,
        firstname,
        lastname,
        birthDate: birthDateString,
        email,
        phonenumber,
        address,
        city,
        state,
        zipcode,
        username,
        password,
        personRole: 'Director',
        twoFactorOn: false,
        recaptchaPayload,
      }),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status, message } = responseJSON;
        if (status === 'SUCCESSFUL_ENROLLMENT') {
          setButtonState('');
          alert.show(
            `You successfully signed up ${organizationName} to use Keep.id. Please login with your new username and password`,
          );
          setRedirectLogin(true);
        } else {
          alert.show(message);
          setButtonState('');
        }
      })
      .catch((error) => {
        alert.show(`Server Failure: ${error}`);
        setButtonState('');
      });
  };

  const handleSignupComponentRender = () => {
    const { role } = props;
    switch (signupStage) {
      case 0: {
        return (
          <AccountSetup
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            onChangeUsername={stateUpdateWrapper(setUsername)}
            onChangePassword={stateUpdateWrapper(setPassword)}
            onChangeConfirmPassword={stateUpdateWrapper(setConfirmPassword)}
            handleContinue={() => setSignupStage(signupStage + 1)}
            role={role}
          />
        );
      }
      case 1: {
        return (
          <PersonalInformation
            firstname={firstname}
            lastname={lastname}
            birthDate={birthDate}
            address={address}
            city={city}
            state={state}
            zipcode={zipcode}
            phonenumber={phonenumber}
            email={email}
            onChangeFirstname={stateUpdateWrapper(setFirstname)}
            onChangeLastname={stateUpdateWrapper(setLastname)}
            onChangeBirthDate={setBirthDate}
            onChangeAddress={stateUpdateWrapper(setAddress)}
            onChangeCity={stateUpdateWrapper(setCity)}
            onChangeState={stateUpdateWrapper(setState)}
            onChangeZipcode={stateUpdateWrapper(setZipcode)}
            onChangePhoneNumber={stateUpdateWrapper(setPhoneNumber)}
            onChangeEmail={stateUpdateWrapper(setEmail)}
            handleContinue={() => setSignupStage(signupStage + 1)}
            handlePrevious={() => setSignupStage(signupStage - 1)}
          />
        );
      }
      case 2: {
        return (
          <OrganizationInformation
            orgName={organizationName}
            orgWebsite={organizationWebsite}
            ein={organizationEIN}
            orgAddress={organizationAddressStreet}
            orgCity={organizationAddressCity}
            orgState={organizationAddressState}
            orgZipcode={organizationAddressZipcode}
            orgPhoneNumber={organizationPhoneNumber}
            orgEmail={organizationEmail}
            onChangeOrgName={stateUpdateWrapper(setOrganizationName)}
            onChangeOrgWebsite={stateUpdateWrapper(setOrganizationWebsite)}
            onChangeOrgEIN={stateUpdateWrapper(setOrganizationEIN)}
            onChangeOrgAddress={stateUpdateWrapper(setOrganizationAddressStreet)}
            onChangeOrgCity={stateUpdateWrapper(setOrganizationAddressCity)}
            onChangeOrgState={stateUpdateWrapper(setOrganizationAddressState)}
            onChangeOrgZipcode={stateUpdateWrapper(setOrganizationAddressZipcode)}
            onChangeOrgPhoneNumber={stateUpdateWrapper(setOrganizationPhoneNumber)}
            onChangeOrgEmail={stateUpdateWrapper(setOrganizationEmail)}
            handleContinue={() => setSignupStage(signupStage + 1)}
            handlePrevious={() => setSignupStage(signupStage - 1)}
          />
        );
      }
      case 3: {
        return (
          <SignUserAgreement
            hasSigned={hasSigned}
            handleChangeSignEULA={setHasSigned}
            handleCanvasSign={setCanvasDataUrl}
            handleContinue={() => setSignupStage(signupStage + 1)}
            handlePrevious={() => setSignupStage(signupStage - 1)}
            canvasDataUrl={canvasDataUrl}
          />
        );
      }
      case 4: {
        return (
          <ReviewSubmit
            username={username}
            password={password}
            firstname={firstname}
            lastname={lastname}
            birthDate={birthDate}
            address={address}
            city={city}
            state={state}
            zipcode={zipcode}
            phonenumber={phonenumber}
            email={email}
            orgName={organizationName}
            orgWebsite={organizationWebsite}
            ein={organizationEIN}
            orgAddress={organizationAddressStreet}
            orgCity={organizationAddressCity}
            orgState={organizationAddressState}
            orgZipcode={organizationAddressZipcode}
            orgPhoneNumber={organizationPhoneNumber}
            orgEmail={organizationEmail}
            handleSubmit={handleFormSubmit}
            handlePrevious={() => setSignupStage(signupStage - 1)}
            handleFormJumpTo={setSignupStage}
            buttonState={buttonState}
            handleChangeRecaptcha={setRecaptchaPayload}
          />
        );
      }
      default: {
        return <div />;
      }
    }
  };

  useEffect(() => {
    if (recaptchaPayload !== '') {
      handleFormSubmit();
    }
  }, [recaptchaPayload]);

  if (redirectLogin) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
    <Helmet>
      <title>Sign Up</title>
      <meta name="description" content="Keep.id" />
    </Helmet>
    <div className="container mt-5">
      <Steps className="d-none d-md-flex" progressDot current={signupStage}>
        <Step title="Account Setup" description="" />
        <Step title="Personal Information" description="" />
        <Step title="Organization Information" description="" />
        <Step title="Sign User Agreement" description="" />
        <Step title="Review & Submit" description="" />
      </Steps>
      <ProgressBar
        className="d-md-none"
        now={signupStage * 25}
        label={`Step ${signupStage + 1} out of 5`}
      />
      {handleSignupComponentRender()}
    </div>
    </div>
  );
};

export default withAlert()(CompleteSignupFlow);
