import React, { Component, ReactComponentElement } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import { Steps } from 'antd';
import { ProgressBar } from 'react-bootstrap';
import { useParams } from 'react-router';
import getServerURL from '../../serverOverride';
// import Logo from '../../static/images/logo.svg';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import AccountSetup from './AccountSetup';
import PersonalInformation from './PersonalInformation';
import SignUserAgreement from './SignUserAgreement';
import ReviewSubmitInviteSignupVersion from './ReviewSubmitInviteSignupVersion';
import USStates from '../../static/data/states_titlecase.json';
import Role from '../../static/Role';

const { Step } = Steps;

interface Props {
  alert: any,
  organization: any,
  role: Role
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
  redirectLogin: boolean
}

class InviteSignupFlow extends Component<Props, State, {}> {
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
    const personRole = this.props.role;
    const birthDateString = this.birthDateStringConverter(birthDate);
    // submit user information

    fetch(`${getServerURL()}/create-user`, {
      method: 'POST',
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
        } = JSON.parse(responseJSON);
        if (status === 'SUCCESSFUL_ENROLLMENT') {
          this.setState({ buttonState: '' });
          this.props.alert.show('You successfully signed up to use Keep.id. Please login with your new username and password');
          this.setState({ redirectLogin: true });
        } else {
          this.props.alert.show(message);
          this.setState({ buttonState: '' });
        }
      }).catch((error) => {
        this.props.alert.show(`Server Failure: ${error}`);
        this.setState({ buttonState: '' });
      });
  }

  birthDateStringConverter = (birthDate: Date) => {
    const personBirthMonth = birthDate.getMonth() + 1;
    const personBirthMonthString = (personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth);
    const personBirthDay = birthDate.getDate();
    const personBirthDayString = (personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay);
    const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
    return personBirthDateFormatted;
  }

  handleFormJumpTo = (pageNumber:number) => this.setState({ signupStage: pageNumber });

  handleSignupComponentRender = () => {
    switch (this.state.signupStage) {
      case 0: {
        return (
          <AccountSetup
            username={this.state.username}
            password={this.state.password}
            confirmPassword={this.state.confirmPassword}
            onChangeUsername={this.handleChangeUsername}
            onChangePassword={this.handleChangePassword}
            onChangeConfirmPassword={this.handleChangeConfirmPassword}
            handleContinue={this.handleContinue}
            role={this.props.role}
          />
        );
      }
      case 1: {
        return (
          <PersonalInformation
            firstname={this.state.firstname}
            lastname={this.state.lastname}
            birthDate={this.state.birthDate}
            address={this.state.address}
            city={this.state.city}
            state={this.state.state}
            zipcode={this.state.zipcode}
            phonenumber={this.state.phonenumber}
            email={this.state.email}
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
            hasSigned={this.state.hasSigned}
            handleChangeSignEULA={this.handleChangeSignEULA}
            handleContinue={this.handleContinue}
            handlePrevious={this.handlePrevious}
          />
        );
      }
      case 3: {
        return (
          <ReviewSubmitInviteSignupVersion
            username={this.state.username}
            password={this.state.password}
            firstname={this.state.firstname}
            lastname={this.state.lastname}
            birthDate={this.state.birthDate}
            address={this.state.address}
            city={this.state.city}
            state={this.state.state}
            zipcode={this.state.zipcode}
            phonenumber={this.state.phonenumber}
            email={this.state.email}
            handleSubmit={this.handleFormSubmit}
            handlePrevious={this.handlePrevious}
            handleFormJumpTo={this.handleFormJumpTo}
            buttonState={this.state.buttonState}
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
            <Step title="Sign User Agreement" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>
          <ProgressBar className="d-md-none" now={this.state.signupStage * 25} label={`Step ${this.state.signupStage + 1} out of 4`} />
          {this.handleSignupComponentRender()}
        </div>
      </div>
    );
  }
}

export default withAlert()(InviteSignupFlow);
