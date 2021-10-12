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
  const [stateObj, setState] = useState<State>({
    signupStage: 0,
    organizationName: '',
    organizationWebsite: '',
    organizationEIN: '',
    organizationAddressStreet: '',
    organizationAddressCity: '',
    organizationAddressState: USStates[0].abbreviation,
    organizationAddressZipcode: '',
    organizationEmail: '',
    organizationPhoneNumber: '',
    firstname: '',
    lastname: '',
    birthDate: new Date(),
    email: '',
    phonenumber: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    username: '',
    password: '',
    confirmPassword: '',
    hasSigned: false,
    canvasDataUrl: '',
    recaptchaPayload: '',
    buttonState: '',
    redirectLogin: false,
  });

  const setStateHelper = (key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleChangeUsername = (e: { target: { value: string } }) =>
    setStateHelper('username', e.target.value);

  const handleChangePassword = (e: { target: { value: string } }) =>
    setStateHelper('password', e.target.value);

  const handleChangeConfirmPassword = (e: { target: { value: string } }) =>
    setStateHelper('confirmPassword', e.target.value);

  const handleChangeFirstname = (e: { target: { value: string } }) =>
    setStateHelper('firstname', e.target.value);

  const handleChangeLastname = (e: { target: { value: string } }) =>
    setStateHelper('lastname', e.target.value);

  const handleChangeBirthdate = (date: Date) =>
    setStateHelper('birthDate', date);

  const handleChangeUserAddress = (e: { target: { value: string } }) =>
    setStateHelper('address', e.target.value);

  const handleChangeUserCity = (e: { target: { value: string } }) =>
    setStateHelper('city', e.target.value);

  const handleChangeUserState = (e: { target: { value: string } }) =>
    setStateHelper('state', e.target.value);

  const handleChangeUserZipcode = (e: { target: { value: string } }) =>
    setStateHelper('zipcode', e.target.value);

  const handleChangeUserPhoneNumber = (e: { target: { value: string } }) =>
    setStateHelper('phonenumber', e.target.value);

  const handleChangeUserEmail = (e: { target: { value: string } }) =>
    setStateHelper('email', e.target.value);

  const handleChangeOrgName = (e: { target: { value: string } }) =>
    setStateHelper('organizationName', e.target.value);

  const handleChangeOrgWebsite = (e: { target: { value: string } }) =>
    setStateHelper('organizationWebsite', e.target.value);

  const handleChangeEIN = (e: { target: { value: string } }) => {
    setStateHelper('organizationEIN', e.target.value);
  };

  const handleChangeOrgAddress = (e: { target: { value: string } }) =>
    setStateHelper('organizationAddressStreet', e.target.value);

  const handleChangeOrgCity = (e: { target: { value: string } }) =>
    setStateHelper('organizationAddressCity', e.target.value);

  const handleChangeOrgState = (e: { target: { value: string } }) =>
    setStateHelper('organizationAddressState', e.target.value);

  const handleChangeOrgZipcode = (e: { target: { value: string } }) =>
    setStateHelper('organizationAddressZipcode', e.target.value);

  const handleChangeOrgPhoneNumber = (e: { target: { value: string } }) =>
    setStateHelper('organizationPhoneNumber', e.target.value);

  const handleChangeOrgEmail = (e: { target: { value: string } }) =>
    setStateHelper('organizationEmail', e.target.value);

  const handleChangeSignEULA = (hasSigned: boolean) => setStateHelper('hasSigned', hasSigned);

  const handleCanvasSign = (dataUrl: string) =>
    setStateHelper('canvasDataUrl', dataUrl);

  const handleChangeRecaptcha = (recaptchaPayload: string) => {
    setStateHelper('recaptchaPayload', recaptchaPayload);
  };

  const handleContinue = (): void => {
    setState((prevState) => ({
      ...prevState,
      signupStage: prevState.signupStage + 1,
    }));
  };

  const handlePrevious = (): void => {
    setState((prevState) => ({
      ...prevState,
      signupStage: prevState.signupStage - 1,
    }));
  };

  const handleFormSubmit = (): void => {
    const {
      username,
      password,
      firstname,
      lastname,
      birthDate,
      address,
      city,
      state,
      zipcode,
      phonenumber,
      email,
      organizationName,
      organizationWebsite,
      organizationEIN,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationPhoneNumber,
      organizationEmail,
      recaptchaPayload,
    } = stateObj;
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
          setStateHelper('buttonState', '');
          alert.show(
            `You successfully signed up ${organizationName} to use Keep.id. Please login with your new username and password`,
          );
          setStateHelper('redirectLogin', true);
        } else {
          alert.show(message);
          setStateHelper('buttonState', '');
        }
      })
      .catch((error) => {
        alert.show(`Server Failure: ${error}`);
        setStateHelper('buttonState', '');
      });
  };

  const handleFormJumpTo = (pageNumber: number) =>
    setStateHelper('signupStage', pageNumber);

  const handleSignupComponentRender = () => {
    const {
      signupStage,
      username,
      password,
      confirmPassword,
      organizationName,
      organizationWebsite,
      organizationEIN,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationEmail,
      organizationPhoneNumber,
      firstname,
      lastname,
      birthDate,
      email,
      phonenumber,
      address,
      city,
      state,
      zipcode,
      hasSigned,
      canvasDataUrl,
      buttonState,
    } = stateObj;
    const { role } = props;
    switch (signupStage) {
      case 0: {
        return (
          <AccountSetup
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            onChangeUsername={handleChangeUsername}
            onChangePassword={handleChangePassword}
            onChangeConfirmPassword={handleChangeConfirmPassword}
            handleContinue={handleContinue}
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
            onChangeFirstname={handleChangeFirstname}
            onChangeLastname={handleChangeLastname}
            onChangeBirthDate={handleChangeBirthdate}
            onChangeAddress={handleChangeUserAddress}
            onChangeCity={handleChangeUserCity}
            onChangeState={handleChangeUserState}
            onChangeZipcode={handleChangeUserZipcode}
            onChangePhoneNumber={handleChangeUserPhoneNumber}
            onChangeEmail={handleChangeUserEmail}
            handleContinue={handleContinue}
            handlePrevious={handlePrevious}
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
            onChangeOrgName={handleChangeOrgName}
            onChangeOrgWebsite={handleChangeOrgWebsite}
            onChangeOrgEIN={handleChangeEIN}
            onChangeOrgAddress={handleChangeOrgAddress}
            onChangeOrgCity={handleChangeOrgCity}
            onChangeOrgState={handleChangeOrgState}
            onChangeOrgZipcode={handleChangeOrgZipcode}
            onChangeOrgPhoneNumber={handleChangeOrgPhoneNumber}
            onChangeOrgEmail={handleChangeOrgEmail}
            handleContinue={handleContinue}
            handlePrevious={handlePrevious}
          />
        );
      }
      case 3: {
        return (
          <SignUserAgreement
            hasSigned={hasSigned}
            handleChangeSignEULA={handleChangeSignEULA}
            handleCanvasSign={handleCanvasSign}
            handleContinue={handleContinue}
            handlePrevious={handlePrevious}
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
            handlePrevious={handlePrevious}
            handleFormJumpTo={handleFormJumpTo}
            buttonState={buttonState}
            handleChangeRecaptcha={handleChangeRecaptcha}
          />
        );
      }
      default: {
        return <div />;
      }
    }
  };

  useEffect(() => {
    if (stateObj.recaptchaPayload !== '') {
      handleFormSubmit();
    }
  }, [stateObj.recaptchaPayload]);

  const { signupStage, redirectLogin } = stateObj;
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
        now={stateObj.signupStage * 25}
        label={`Step ${stateObj.signupStage + 1} out of 5`}
      />
      {handleSignupComponentRender()}
    </div>
    </div>
  );
};

export default withAlert()(CompleteSignupFlow);
