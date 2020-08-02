import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';
import { withAlert } from 'react-alert';
import { Steps } from 'antd';
import DatePicker from 'react-datepicker';
import Role from '../../static/Role';
import USStates from '../../static/data/states_titlecase.json';
import getServerURL from '../../serverOverride';
import { reCaptchaKey } from '../../configVars';
import Logo from '../../static/images/logo.svg';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import AccountSetup from './AccountSetup';
import PersonalInformation from './PersonalInformation';
import OrganizationInformation from './OrganizationInformation';

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
  personSubmitted: boolean,
  submitSuccessful: boolean,
  recaptchaLoaded: boolean,
  recaptchaPayload: string,
  recaptchaExpired: boolean
}
const _reCaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

class CompleteSignupFlow extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      signupStage: 2,
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
      personSubmitted: false,
      submitSuccessful: false,
      recaptchaLoaded: false,
      recaptchaPayload: '',
      recaptchaExpired: false,
    };
    this.handleRecaptchaChange = this.handleRecaptchaChange.bind(this);
  }

  // RECAPTCHA CODE
  componentDidMount() {
    this.setState({ recaptchaLoaded: true });
  }

  handleRecaptchaChange = (recaptchaPayload) => {
    this.setState({ recaptchaPayload });
    if (recaptchaPayload === null) this.setState({ recaptchaExpired: true });
  };
  // RECAPTCHA

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

  handleContinue = ():void => {
    this.setState({ signupStage: this.state.signupStage + 1 });
  };

  handlePrevious = (): void => {
    this.setState({ signupStage: this.state.signupStage - 1 });
  }

  handleFormSubmit = (): void => {
    // submit organization and director information
  }

  handleSignupComponentRender() {
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
        break;
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
        break;
      }
      case 2: {
        return (
          <OrganizationInformation
            orgName={this.state.organizationName}
            orgWebsite={this.state.lastname}
            ein={this.state.organizationEIN}
            orgAddress={this.state.address}
            orgCity={this.state.city}
            orgState={this.state.state}
            orgZipcode={this.state.zipcode}
            orgPhoneNumber={this.state.phonenumber}
            orgEmail={this.state.email}
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
        break;
      }
      case 3: {
        break;
      }
      case 4: {
        break;
      }
      default: {
        // statements;
        break;
      }
    }
  }

  render() {
    const {
      signupStage,
      recaptchaLoaded,
    } = this.state;

    return (
      <div>
        <Helmet>
          <title>
            Sign Up
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="container">
          <div className="row pt-5 pb-5">
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
          </div>

          <Steps progressDot current={signupStage}>
            <Step title="Account Setup" description="" />
            <Step title="Personal Information" description="" />
            <Step title="Organization Information" description="" />
            <Step title="Sign User Agreement" description="" />
            <Step title="Review & Submit" description="" />
          </Steps>

          {this.handleSignupComponentRender()}
        </div>
        {recaptchaLoaded && (
          <ReCAPTCHA
            theme="dark"
            size="invisible"
            ref={_reCaptchaRef}
            sitekey={reCaptchaKey}
            onChange={this.handleRecaptchaChange}
          />
        )}
      </div>
    );
  }
}

export default withAlert()(CompleteSignupFlow);
