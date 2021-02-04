import 'antd/dist/antd.css';

import { Steps } from 'antd';
import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import { ProgressBar } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { Redirect } from 'react-router-dom';

import getServerURL from '../../serverOverride';
import Role from '../../static/Role';
import { birthDateStringConverter } from './CompleteSignupFlow';
import AccountSetup from './pages/AccountSetup';
import PersonalInformation from './pages/PersonalInformation';
import SignUserAgreement from './pages/SignUserAgreement';
import ReviewSubmitInviteSignupVersion from './ReviewSubmitInviteSignupVersion';

const { Step } = Steps;

interface Props {
  alert: any,
  personRole: Role,
}

interface State {
  signupStage: number,
  username: string,
  password: string,
  confirmPassword: string,
  firstname: string,
  lastname: string,
  birthDate: Date,
  email: string,
  phonenumber: string,
  address: string,
  city: string,
  state: string,
  zipcode: string,
  hasSigned: boolean,
  recaptchaPayload: string,
  buttonState: string,
  redirectLogin: boolean,
}

class PersonSignupFlow extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      signupStage: 0,
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
      recaptchaPayload: '',
      buttonState: '',
      redirectLogin: false,
    };
  }

  handleChangeUsername = (e: { target: { value: string; }; }) => this.setState({ username: e.target.value });

  handleChangePassword = (e: { target: { value: string; }; }) => this.setState({ password: e.target.value });

  handleChangeConfirmPassword = (e: { target: { value: string; }; }) => this.setState({ confirmPassword: e.target.value });

  handleChangeFirstname = (e: { target: { value: string; }; }) => this.setState({ firstname: e.target.value });

  handleChangeLastname = (e: { target: { value: string; }; }) => this.setState({ lastname: e.target.value });

  handleChangeBirthdate = (date: Date) => this.setState({ birthDate: date });

  handleChangeUserAddress = (e: { target: { value: string; }; }) => this.setState({ address: e.target.value });

  handleChangeUserCity = (e: { target: { value: string; }; }) => this.setState({ city: e.target.value });

  handleChangeUserState = (e: { target: { value: string; }; }) => this.setState({ state: e.target.value });

  handleChangeUserZipcode = (e: { target: { value: string; }; }) => this.setState({ zipcode: e.target.value });

  handleChangeUserPhoneNumber = (e: { target: { value: string; }; }) => this.setState({ phonenumber: e.target.value });

  handleChangeUserEmail = (e: { target: { value: string; }; }) => this.setState({ email: e.target.value });

  handleChangeSignEULA = (hasSigned: boolean) => this.setState({ hasSigned });

  handleChangeRecaptcha = (recaptchaPayload: string) => {
    this.setState({ recaptchaPayload }, this.handleFormSubmit);
  }

  handleContinue = ():void => {
    this.setState((prevState) => ({ signupStage: prevState.signupStage + 1 }));
  };

  handlePrevious = (): void => {
    this.setState((prevState) => ({ signupStage: prevState.signupStage - 1 }));
  }

  handleFormSubmit = (): void => {
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
      recaptchaPayload,
    } = this.state;
    const { alert, personRole } = this.props;
    const birthDateString = birthDateStringConverter(birthDate);
    fetch(`${getServerURL()}/create-user`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        firstname,
        lastname,
        birthDate: birthDateString,
        email,
        phonenumber,
        address,
        city,
        state,
        zipcode,
        twoFactorOn: false,
        username,
        password,
        personRole,
        recaptchaPayload,
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          message,
        } = responseJSON;
        if (status === 'ENROLL_SUCCESS') {
          this.setState({ buttonState: '' });
          alert.show(`Successful ${personRole} signup to use Keep.id. You can login with the new username and password`);
          this.setState({ redirectLogin: true });
        } else if (status === 'INVALID_PARAMETER') {
          this.setState({ buttonState: '' });
          alert.show('No organization found for this link. Try again with different link');
        } else {
          alert.show(message);
          this.setState({ buttonState: '' });
        }
      }).catch((error) => {
        alert.show(`Server Failure: ${error}`);
        this.setState({ buttonState: '' });
      });
  }

  handleFormJumpTo = (pageNumber:number):void => this.setState({ signupStage: pageNumber });

  handleSignupComponentRender = ():JSX.Element => {
    const {
      username,
      password,
      confirmPassword,
      firstname,
      lastname,
      birthDate,
      address,
      city,
      state,
      zipcode,
      phonenumber,
      email,
      hasSigned,
      buttonState,
      signupStage,
    } = this.state;

    const {
      personRole,
    } = this.props;

    switch (signupStage) {
      case 0: {
        return (
          <AccountSetup
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            onChangeUsername={this.handleChangeUsername}
            onChangePassword={this.handleChangePassword}
            onChangeConfirmPassword={this.handleChangeConfirmPassword}
            handleContinue={this.handleContinue}
            role={personRole}
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
            onChangeFirstname={this.handleChangeFirstname}
            onChangeLastname={this.handleChangeLastname}
            onChangeBirthDate={this.handleChangeBirthdate}
            onChangeAddress={this.handleChangeUserAddress}
            onChangeCity={this.handleChangeUserCity}
            onChangeState={this.handleChangeUserState}
            onChangeZipcode={this.handleChangeUserZipcode}
            onChangePhoneNumber={this.handleChangeUserPhoneNumber}
            onChangeEmail={this.handleChangeUserEmail}
            handleContinue={this.handleContinue}
            handlePrevious={this.handlePrevious}
          />
        );
      }
      case 2: {
        return (
          <SignUserAgreement
            hasSigned={hasSigned}
            handleChangeSignEULA={this.handleChangeSignEULA}
            handleContinue={this.handleContinue}
            handlePrevious={this.handlePrevious}
          />
        );
      }
      case 3: {
        return (
          <ReviewSubmitInviteSignupVersion
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
            handleSubmit={this.handleFormSubmit}
            handlePrevious={this.handlePrevious}
            handleFormJumpTo={this.handleFormJumpTo}
            buttonState={buttonState}
            handleChangeRecaptcha={this.handleChangeRecaptcha}
          />
        );
      }
      default: {
        return (
          <div />
        );
      }
    }
  }

  render() {
    const {
      signupStage,
      redirectLogin,
    } = this.state;
    const { personRole } = this.props;
    if (redirectLogin) {
      return (
        <Redirect to="/login" />
      );
    }

    return (
      <div>
        <Helmet>
          <title>
            Sign Up
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container mt-5">
          <Steps className="d-none d-md-flex" progressDot current={signupStage}>
            <Step title={`${personRole} Account Setup`} description="" />
            <Step title="Personal Information" description="" />
            <Step title="Sign User Agreement" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>
          <ProgressBar className="d-md-none" now={signupStage * 25} label={`Step ${signupStage + 1} out of 4`} />
          {this.handleSignupComponentRender()}
        </div>
      </div>
    );
  }
}

export default withAlert()(PersonSignupFlow);
