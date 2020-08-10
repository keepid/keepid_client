import React, { Component, ReactComponentElement } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import { Steps } from 'antd';
import { ProgressBar } from 'react-bootstrap';
import getServerURL from '../../serverOverride';
// import Logo from '../../static/images/logo.svg';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import AccountSetup from './AccountSetup';
import PersonalInformation from './PersonalInformation';
import OrganizationInformation from './OrganizationInformation';
import SignUserAgreement from './SignUserAgreement';
import ReviewSubmit from './ReviewSubmit';
import USStates from '../../static/data/states_titlecase.json';

const { Step } = Steps;

interface Props {
  alert: any
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
  recaptchaPayload: string,
  buttonState: string,
  redirectLogin: boolean
}

class CompleteSignupFlow extends Component<Props, State, {}> {
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

  handleChangeRecaptcha = (recaptchaPayload: string) => {
    this.setState({ recaptchaPayload }, this.handleFormSubmit);
  }

  handleContinue = ():void => {
    this.setState((prevState) => ({ signupStage: prevState.signupStage + 1 }));
    // this.setState({ signupStage: this.state.signupStage + 1 });
  };

  handlePrevious = (): void => {
    this.setState((prevState) => ({ signupStage: prevState.signupStage - 1 }));
    // this.setState({ signupStage: this.state.signupStage - 1 });
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
    const birthDateString = this.birthDateStringConverter(birthDate);
    // submit organization and director information
    fetch(`${getServerURL()}/organization-signup`, {
      method: 'POST',
      body: JSON.stringify({
        organizationWebsite,
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
        } = JSON.parse(responseJSON);
        if (status === 'SUCCESSFUL_ENROLLMENT') {
          this.setState({ buttonState: '' });
          this.props.alert.show(`You successfully signed up ${organizationName} to use Keep.id. Please login with your new username and password`);
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
          <OrganizationInformation
            orgName={this.state.organizationName}
            orgWebsite={this.state.organizationWebsite}
            ein={this.state.organizationEIN}
            orgAddress={this.state.organizationAddressStreet}
            orgCity={this.state.organizationAddressCity}
            orgState={this.state.organizationAddressState}
            orgZipcode={this.state.organizationAddressZipcode}
            orgPhoneNumber={this.state.organizationPhoneNumber}
            orgEmail={this.state.organizationEmail}
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
            hasSigned={this.state.hasSigned}
            handleChangeSignEULA={this.handleChangeSignEULA}
            handleContinue={this.handleContinue}
            handlePrevious={this.handlePrevious}
          />
        );
      }
      case 4: {
        return (
          <ReviewSubmit
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
            orgName={this.state.organizationName}
            orgWebsite={this.state.organizationWebsite}
            ein={this.state.organizationEIN}
            orgAddress={this.state.address}
            orgCity={this.state.city}
            orgState={this.state.state}
            orgZipcode={this.state.zipcode}
            orgPhoneNumber={this.state.phonenumber}
            orgEmail={this.state.email}
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
          {/* <div className="row pt-5 pb-5">
            <div className="col-md-3">
              <button type="button" className="btn btn-outline-primary float-left">Back to Home</button>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-center">
                <img alt="Keep.id Logo" className="footer-brand img-fluid mb-2 ml-3" src={Logo} />
                <div className="mb-2 ml-3 footer-brand-logo">Keep.id</div>
              </div>
            </div>
            <div className="col-md-3">
              <button type="button" className="btn btn-outline-primary float-right">Log In</button>
            </div>
          </div> */}

          <Steps className="d-none d-md-flex" progressDot current={signupStage}>
            <Step title="Account Setup" description="" />
            <Step title="Personal Information" description="" />
            <Step title="Organization Information" description="" />
            <Step title="Sign User Agreement" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>
          <ProgressBar className="d-md-none" now={this.state.signupStage * 25} label={`Step ${this.state.signupStage + 1} out of 5`} />
          {this.handleSignupComponentRender()}
        </div>
      </div>
    );
  }
}

export default withAlert()(CompleteSignupFlow);
