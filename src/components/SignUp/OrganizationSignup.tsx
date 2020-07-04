import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';
import { withAlert } from 'react-alert';
import Role from '../../static/Role';
import USStates from '../../static/data/states_titlecase.json';
import SignaturePad from '../../lib/react-typescript-signature-pad';
import getServerURL from '../../serverOverride';
import { reCaptchaKey } from '../../configVars';
import Signup from './Signup';

interface Props {
  alert: any
}

interface State {
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
  birthDate: string,
  email: string,
  phonenumber: string,
  address: string,
  city: string,
  state: string,
  zipcode: string,
  username: string,
  password: string,
  acceptEULA: boolean,
  reaffirmStage: boolean,
  personSubmitted: boolean,
  submitSuccessful: boolean,
  buttonState: string,
  recaptchaLoaded: boolean,
  recaptchaPayload: string,
  recaptchaExpired: boolean
}
const _reCaptchaRef: React.RefObject<ReCAPTCHA> = React.createRef();

class OrganizationSignup extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
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
      birthDate: '',
      email: '',
      phonenumber: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      username: '',
      password: '',
      acceptEULA: false,
      reaffirmStage: false,
      personSubmitted: false,
      submitSuccessful: false,
      buttonState: '',
      recaptchaLoaded: false,
      recaptchaPayload: '',
      recaptchaExpired: false,
    };
    this.handleBack = this.handleBack.bind(this);
    this.handleContinue = this.handleContinue.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSubmitProp = this.onSubmitProp.bind(this);
    this.handleChangeOrganizationName = this.handleChangeOrganizationName.bind(this);
    this.handleChangeOrganizationWebsite = this.handleChangeOrganizationWebsite.bind(this);
    this.handleChangeOrganizationEIN = this.handleChangeOrganizationEIN.bind(this);
    this.handleChangeOrganizationAddressStreet = this.handleChangeOrganizationAddressStreet.bind(this);
    this.handleChangeOrganizationAddressCity = this.handleChangeOrganizationAddressCity.bind(this);
    this.handleChangeOrganizationAddressState = this.handleChangeOrganizationAddressState.bind(this);
    this.handleChangeOrganizationAddressZipcode = this.handleChangeOrganizationAddressZipcode.bind(this);
    this.handleChangeOrganizationEmail = this.handleChangeOrganizationEmail.bind(this);
    this.handleChangeOrganizationPhoneNumber = this.handleChangeOrganizationPhoneNumber.bind(this);
    this.handleChangeReaffirmStage = this.handleChangeReaffirmStage.bind(this);
    this.handleChangeAcceptEULA = this.handleChangeAcceptEULA.bind(this);
    this.handleChangePersonSubmitted = this.handleChangePersonSubmitted.bind(this);
    this.handleRecaptchaChange = this.handleRecaptchaChange.bind(this);
  }

  handleBack(event: any) {
    this.setState({ reaffirmStage: false });
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

  handleContinue(event: any) {
    event.preventDefault();
    const {
      organizationWebsite,
      organizationName,
      organizationEIN,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationEmail,
      organizationPhoneNumber,
    } = this.state;
    fetch(`${getServerURL()}/organization-signup-validator`, {
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
      }),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const {
          status,
          message,
        } = JSON.parse(responseJSON);
        if (status === 'SUCCESS') {
          this.setState({ reaffirmStage: true });
        } else {
          this.props.alert.show(message);
        }
      }).catch((error) => {
        this.props.alert.show(`Server Failure: ${error}`);
      });
  }

  handleSubmit(event: any) {
    this.setState({ buttonState: 'running' });
    const {
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
      birthDate,
      email,
      phonenumber,
      address,
      city,
      state,
      zipcode,
      username,
      password,
      acceptEULA,
      recaptchaPayload,
      recaptchaLoaded,
      recaptchaExpired,
    } = this.state;
    if (!acceptEULA) {
      this.props.alert.show('You must read and accept the EULA before submitting the application');
      this.setState({ buttonState: '' });
    } else if (!recaptchaLoaded || recaptchaExpired) {
      this.props.alert.show('Recaptcha has expired. Please refresh the page');
      this.setState({ buttonState: '' });
    } else {
      if (_reCaptchaRef && _reCaptchaRef.current) {
        _reCaptchaRef.current.execute();
        console.log('executed');
      }
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
          birthDate,
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
            recaptchaPayload,
          } = JSON.parse(responseJSON);
          if (status === 'SUCCESSFUL_ENROLLMENT') {
            this.setState({ buttonState: '' });
            this.setState({ submitSuccessful: true });
            this.props.alert.show(message);
          } else {
            this.props.alert.show(message);
            this.setState({ buttonState: '' });
          }
        }).catch((error) => {
          this.props.alert.show(`Server Failure: ${error}`);
          this.setState({ buttonState: '' });
        });
    }
  }

  onSubmitProp(firstname, lastname, birthDate, email,
    phonenumber, address, city, state,
    zipcode, username, password, personRoleString) {
    this.setState({
      personSubmitted: true,
      firstname,
      lastname,
      birthDate,
      email,
      phonenumber,
      address,
      city,
      state,
      zipcode,
      username,
      password,
    });
  }

  handleChangeOrganizationName(event: any) {
    this.setState({ organizationName: event.target.value });
  }

  handleChangeOrganizationWebsite(event: any) {
    this.setState({ organizationWebsite: event.target.value });
  }

  handleChangeOrganizationEIN(event: any) {
    this.setState({ organizationEIN: event.target.value });
  }

  handleChangeOrganizationAddressStreet(event: any) {
    this.setState({ organizationAddressStreet: event.target.value });
  }

  handleChangeOrganizationAddressCity(event: any) {
    this.setState({ organizationAddressCity: event.target.value });
  }

  handleChangeOrganizationAddressState(event: any) {
    this.setState({ organizationAddressState: event.target.value });
  }

  handleChangeOrganizationAddressZipcode(event: any) {
    this.setState({ organizationAddressZipcode: event.target.value });
  }

  handleChangeOrganizationEmail(event: any) {
    this.setState({ organizationEmail: event.target.value });
  }

  handleChangeOrganizationPhoneNumber(event: any) {
    this.setState({ organizationPhoneNumber: event.target.value });
  }

  handleChangeAcceptEULA(acceptEULA: boolean) {
    this.setState({ acceptEULA });
  }

  handleChangeReaffirmStage(event: any) {
    event.preventDefault();
    const {
      reaffirmStage,
    } = this.state;
    this.setState({ reaffirmStage: !reaffirmStage });
  }

  handleChangePersonSubmitted(event: any) {
    const {
      personSubmitted,
    } = this.state;
    this.setState({ personSubmitted: !personSubmitted });
  }

  render() {
    const {
      organizationWebsite,
      organizationName,
      organizationEIN,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationEmail,
      organizationPhoneNumber,
      acceptEULA,
      personSubmitted,
      submitSuccessful,
      reaffirmStage,
      recaptchaLoaded,
    } = this.state;

    const organizationFormHeader = !reaffirmStage ? 'Organization Signup Form' : 'Finish Organization Signup';
    const organizationFormBody = !reaffirmStage
      ? 'Thank you for expressing interest in using Keep.id to secure documents for the housing-vulnerable. Please fill out the following form so we can get back to you with instructions on how to proceed. The contact should be the organization leader who will control the privileges of all users of the service.'
      : 'Please check the information below for accuracy and read and sign the EULA below to indicate your consent to the terms and conditions.';
    const organizationForm = (
      <div className="container">
        <Helmet>
          <title>Organization Signup</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col">
            <div className="jumbotron jumbotron-fluid bg-white pb-2 mb-2">
              <div className="container">
                <h1 className="display-5 text-center font-weight-bold mb-3">{organizationFormHeader}</h1>
                <p className="lead">{organizationFormBody}</p>
              </div>
            </div>
            <form onSubmit={this.handleContinue}>
              <div className="col-md-12">
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputOrgName" className="w-100 pr-3">
                      Organization Name
                      <span className="red-star">*</span>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputOrgName" placeholder="Keep" value={organizationName} onChange={this.handleChangeOrganizationName} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputOrgWebsite" className="w-100 pr-3">
                      Organization Website
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputOrgWebsite" placeholder="https://www.keep.id" value={organizationWebsite} onChange={this.handleChangeOrganizationWebsite} />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputEIN" className="w-100 pr-3">
                      Organization EIN
                      <span className="red-star">*</span>
                      <input readOnly={reaffirmStage} type="text" className="form-control form-purple" id="inputEIN" placeholder="12-3456789" value={organizationEIN} onChange={this.handleChangeOrganizationEIN} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputAddress" className="w-100 pr-3">
                      Organization Address
                      <span className="red-star">*</span>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputAddress" placeholder="311 Broad St" value={organizationAddressStreet} onChange={this.handleChangeOrganizationAddressStreet} required />
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputCity" className="w-100 pr-3">
                      City
                      <span className="red-star">*</span>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputCity" placeholder="Philadelphia" value={organizationAddressCity} onChange={this.handleChangeOrganizationAddressCity} required />
                    </label>
                  </div>
                  <div className="col-md-2 form-group">
                    <label htmlFor="inputState" className="w-100 pr-3">
                      State
                      <span className="red-star">*</span>
                      <select disabled={reaffirmStage} className="form-control form-purple" id="inputState" value={organizationAddressState} onChange={this.handleChangeOrganizationAddressState} required>
                        {USStates.map((USState) => (<option key={USState.abbreviation}>{USState.abbreviation}</option>))}
                      </select>
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputZipCode" className="w-100 pr-3">
                      Zipcode
                      <span className="red-star">*</span>
                      <input readOnly={reaffirmStage} type="text" className="form-control form-purple" id="inputZipCode" placeholder="19104" value={organizationAddressZipcode} onChange={this.handleChangeOrganizationAddressZipcode} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-5 form-group">
                    <label htmlFor="inputPhoneNumber" className="w-100 pr-3">
                      Organization Phone Number
                      <span className="red-star">*</span>
                      <input
                        readOnly={reaffirmStage}
                        type="tel"
                        className="form-control form-purple"
                        id="inputPhoneNumber"
                        onChange={this.handleChangeOrganizationPhoneNumber}
                        value={organizationPhoneNumber}
                        placeholder="1-(234)-567-8901"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-7 form-group">
                    <label htmlFor="inputEmail" className="w-100 pr-3">
                      Organization Email Address
                      <span className="red-star">*</span>
                      <input
                        readOnly={reaffirmStage}
                        type="email"
                        className="form-control form-purple"
                        id="inputEmail"
                        onChange={this.handleChangeOrganizationEmail}
                        value={organizationEmail}
                        placeholder="contact@example.com"
                        required
                      />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  {!reaffirmStage
                    ? (
                      <div className="w-100">
                        <div>
                          <p className="mb-1">
                            <span className="red-star">*</span>
                            Required Field.
                          </p>
                          <span className="text-muted recaptcha-login-text">
                            This page is protected by reCAPTCHA, and subject to the Google
                            {' '}
                            <a href="https://www.google.com/policies/privacy/">Privacy Policy </a>
                            and
                            {' '}
                            <a href="https://www.google.com/policies/terms/">Terms of service</a>
                            .
                          </span>
                        </div>
                        <div className="pr-3 mr-1">
                          <input type="submit" className="btn btn-primary btn-lg float-right" value="Continue" />
                        </div>
                      </div>
                    ) : <br />}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );

    if (submitSuccessful) {
      return (<Redirect to="/" />);
    }
    if (!personSubmitted) {
      return (<Signup onSubmitProp={this.onSubmitProp} personRole={Role.Director} buttonState="" />);
    }
    if (!reaffirmStage) {
      return (<div>{ organizationForm }</div>);
    }
    return (
      <div className="container">
        {organizationForm}
        <div className="row mt-5">
          <p className="textPrintDesc pl-3">
            <span>End User License Agreement</span>
          </p>
          <div className="embed-responsive embed-responsive-16by9">
            <iframe className="embed-responsive-item" src="eula-template.pdf" title="EULA Agreement" />
          </div>
        </div>
        <div className="row mt-5">
          <p className="textPrintDesc pl-3">
            <span>I agree to all terms and conditions in the EULA above</span>
          </p>
        </div>
        <div className="row mt-0 mb-auto">
          <div className="col-md-6 pb-3 pl-0 pr-0">
            <SignaturePad acceptEULA={acceptEULA} handleChangeAcceptEULA={this.handleChangeAcceptEULA} />
          </div>
          <div className="col-md-6 text-right">
            <button type="button" onClick={this.handleChangePersonSubmitted} className="btn btn-warning mr-4 mb-4">Back to Director Signup</button>
            <button type="button" onClick={this.handleBack} className="btn btn-danger mr-4 mb-4">Back</button>
            <button type="submit" onClick={this.handleSubmit} className={`btn btn-success ld-ext-right ${this.state.buttonState}`}>
              Submit
              <div className="ld ld-ring ld-spin" />
            </button>
          </div>
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

export default withAlert()(OrganizationSignup);
