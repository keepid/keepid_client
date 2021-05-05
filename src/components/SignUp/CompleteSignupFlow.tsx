import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { Steps } from 'antd';
import React, { Component } from 'react';
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
const urlPattern: RegExp = new RegExp('^(http:www.)|(https:www.)|(http:(.*)|https:)(.*)$');

interface Props {
  alert: any
  role: Role
}

interface State {
  signupStage: number,
  username: string,
  password: string,
  confirmPassword: string,
  organizationName: string,
  organizationWebsite: string,
  organizationEIN: string,
  organizationAddressStreet: string,
  organizationAddressCity: string,
  organizationAddressState: string,
  organizationAddressZipcode: string,
  organizationEmail: string,
  organizationPhoneNumber: string,
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
  canvasDataUrl: string,
  recaptchaPayload: string,
  buttonState: string,
  redirectLogin: boolean
}

export class CompleteSignupFlow extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
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
    };
  }

  static addHttp = (url: string) => {
    if (!urlPattern.test(url)) {
      return `http://${url}`;
    }
    return url;
  }

  static birthDateStringConverter = (birthDate: Date) => {
    const personBirthMonth = birthDate.getMonth() + 1;
    const personBirthMonthString = (personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth);
    const personBirthDay = birthDate.getDate();
    const personBirthDayString = (personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay);
    const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
    return personBirthDateFormatted;
  }

  handleChangeUsername = (e: { target: { value: string; }; }) => this.setState({ username: e.target.value });

  handleChangePassword = (e: { target: { value: string; }; }) => this.setState({ password: e.target.value });

  handleChangeConfirmPassword = (e: { target: { value: string; }; }) => this.setState({ confirmPassword: e.target.value });

  handleChangeFirstname = (e: { target: { value: string; }; }) => this.setState({ firstname: e.target.value });

  handleChangeLastname = (e: { target: { value: string; }; }) => this.setState({ lastname: e.target.value });

  handleChangeBirthdate = (date: Date, callback) => this.setState({ birthDate: date }, callback);

  handleChangeUserAddress = (e: { target: { value: string; }; }) => this.setState({ address: e.target.value });

  handleChangeUserCity = (e: { target: { value: string; }; }) => this.setState({ city: e.target.value });

  handleChangeUserState = (e: { target: { value: string; }; }) => this.setState({ state: e.target.value });

  handleChangeUserZipcode = (e: { target: { value: string; }; }) => this.setState({ zipcode: e.target.value });

  handleChangeUserPhoneNumber = (e: { target: { value: string; }; }) => this.setState({ phonenumber: e.target.value });

  handleChangeUserEmail = (e: { target: { value: string; }; }) => this.setState({ email: e.target.value });

  handleChangeOrgName = (e: { target: { value: string; }; }) => this.setState({ organizationName: e.target.value });

  handleChangeOrgWebsite = (e: { target: { value: string; }; }) => this.setState({ organizationWebsite: e.target.value });

  handleChangeEIN = (e: { target: { value: string; }; }) => this.setState({ organizationEIN: e.target.value });

  handleChangeOrgAddress = (e: { target: { value: string; }; }) => this.setState({ organizationAddressStreet: e.target.value });

  handleChangeOrgCity = (e: { target: { value: string; }; }) => this.setState({ organizationAddressCity: e.target.value });

  handleChangeOrgState = (e: { target: { value: string; }; }) => this.setState({ organizationAddressState: e.target.value });

  handleChangeOrgZipcode = (e: { target: { value: string; }; }) => this.setState({ organizationAddressZipcode: e.target.value });

  handleChangeOrgPhoneNumber = (e: { target: { value: string; }; }) => this.setState({ organizationPhoneNumber: e.target.value });

  handleChangeOrgEmail = (e: { target: { value: string; }; }) => this.setState({ organizationEmail: e.target.value });

  handleChangeSignEULA = (hasSigned: boolean) => this.setState({ hasSigned });

  handleCanvasSign = (dataUrl: string) => this.setState({ canvasDataUrl: dataUrl });

  handleChangeRecaptcha = (recaptchaPayload: string) => {
    this.setState({ recaptchaPayload }, this.handleFormSubmit);
  }

  handleContinue = (): void => {
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
    } = this.state;
    const { alert } = this.props;
    const birthDateString = CompleteSignupFlow.birthDateStringConverter(birthDate);
    const revisedURL = CompleteSignupFlow.addHttp(organizationWebsite);

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
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          message,
        } = responseJSON;
        if (status === 'SUCCESSFUL_ENROLLMENT') {
          this.setState({ buttonState: '' });
          alert.show(`You successfully signed up ${organizationName} to use Keep.id. Please login with your new username and password`);
          this.setState({ redirectLogin: true });
        } else {
          alert.show(message);
          this.setState({ buttonState: '' });
        }
      }).catch((error) => {
        alert.show(`Server Failure: ${error}`);
        this.setState({ buttonState: '' });
      });
  }

  handleFormJumpTo = (pageNumber: number) => this.setState({ signupStage: pageNumber });

  handleSignupComponentRender = () => {
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
    } = this.state;
    const { role } = this.props;
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
            onChangeOrgName={this.handleChangeOrgName}
            onChangeOrgWebsite={this.handleChangeOrgWebsite}
            onChangeOrgEIN={this.handleChangeEIN}
            onChangeOrgAddress={this.handleChangeOrgAddress}
            onChangeOrgCity={this.handleChangeOrgCity}
            onChangeOrgState={this.handleChangeOrgState}
            onChangeOrgZipcode={this.handleChangeOrgZipcode}
            onChangeOrgPhoneNumber={this.handleChangeOrgPhoneNumber}
            onChangeOrgEmail={this.handleChangeOrgEmail}
            handleContinue={this.handleContinue}
            handlePrevious={this.handlePrevious}
          />
        );
      }
      case 3: {
        return (
          <SignUserAgreement
            hasSigned={hasSigned}
            handleChangeSignEULA={this.handleChangeSignEULA}
            handleCanvasSign={this.handleCanvasSign}
            handleContinue={this.handleContinue}
            handlePrevious={this.handlePrevious}
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
            <Step title="Account Setup" description="" />
            <Step title="Personal Information" description="" />
            <Step title="Organization Information" description="" />
            <Step title="Sign User Agreement" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>
          <ProgressBar className="d-md-none" now={signupStage * 25} label={`Step ${signupStage + 1} out of 5`} />
          {this.handleSignupComponentRender()}
        </div>
      </div>
    );
  }
}

export const { birthDateStringConverter } = CompleteSignupFlow;
export const { addHttp } = CompleteSignupFlow;
export default withAlert()(CompleteSignupFlow);
