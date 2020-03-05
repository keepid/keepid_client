import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ReCAPTCHA from 'react-google-recaptcha';
import USStates from '../static/data/states_titlecase.json';
import SignaturePad from '../lib/react-typescript-signature-pad';
import getServerURL from '../serverOverride';

interface State {
  submitSuccessful: boolean,
  organizationName: string,
  organizationStatus: string,
  organizationWebsite: string,
  organizationEIN: string,
  firstName: string,
  lastName: string,
  contactEmail: string,
  contactPhoneNumber: string,
  organizationAddressStreet: string,
  organizationAddressCity: string,
  organizationAddressState: string,
  organizationAddressZipcode: string,
  username:string,
  password: string,
  confirmPassword: string,
  acceptEULA: boolean,
  reaffirmStage: boolean
}

class OrganizationSignup extends Component<{}, State, {}> {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      submitSuccessful: false,
      organizationName: '',
      organizationStatus: '', // 501c3, etc.
      organizationWebsite: 'http://',
      organizationEIN: '',
      firstName: '',
      lastName: '',
      contactEmail: '',
      contactPhoneNumber: '',
      organizationAddressStreet: '',
      organizationAddressCity: '',
      organizationAddressState: USStates[0].abbreviation,
      organizationAddressZipcode: '',
      username: '',
      password: '',
      confirmPassword: '',
      acceptEULA: false,
      reaffirmStage: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangeOrganizationName = this.handleChangeOrganizationName.bind(this);
    this.handleChangeOrganizationStatus = this.handleChangeOrganizationStatus.bind(this);
    this.handleChangeOrganizationWebsite = this.handleChangeOrganizationWebsite.bind(this);
    this.handleChangeOrganizationEIN = this.handleChangeOrganizationEIN.bind(this);
    this.handleChangeFirstName = this.handleChangeFirstName.bind(this);
    this.handleChangeLastName = this.handleChangeLastName.bind(this);
    this.handleChangeContactEmail = this.handleChangeContactEmail.bind(this);
    this.handleChangeContactPhoneNumber = this.handleChangeContactPhoneNumber.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeConfirmPassword = this.handleChangeConfirmPassword.bind(this);
    this.handleChangeOrganizationAddressStreet = this.handleChangeOrganizationAddressStreet.bind(this);
    this.handleChangeOrganizationAddressCity = this.handleChangeOrganizationAddressCity.bind(this);
    this.handleChangeOrganizationAddressState = this.handleChangeOrganizationAddressState.bind(this);
    this.handleChangeOrganizationAddressZipcode = this.handleChangeOrganizationAddressZipcode.bind(this);
    this.handleChangeReaffirmStage = this.handleChangeReaffirmStage.bind(this);
    this.handleChangeAcceptEULA = this.handleChangeAcceptEULA.bind(this);
    this.captchaVerify = this.captchaVerify.bind(this);
  }

  captchaVerify(value) {
    console.log('Captcha value:', value);
  }

  handleSubmit(event: any) {
    const {
      organizationWebsite,
      firstName,
      lastName,
      contactPhoneNumber,
      organizationName,
      organizationStatus,
      contactEmail,
      username,
      password,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationEIN,
      acceptEULA,
    } = this.state;
    if (!acceptEULA) {
      alert('You must read and accept the EULA before submitting the application');
    } else {
      fetch(`${getServerURL()}/organization-signup`, {
        method: 'POST',
        body: JSON.stringify({
          orgWebsite: organizationWebsite,
          firstName,
          lastName,
          phone: contactPhoneNumber,
          orgName: organizationName,
          orgStatus: organizationStatus,
          email: contactEmail,
          username,
          password,
          address: organizationAddressStreet,
          city: organizationAddressCity,
          state: organizationAddressState,
          zipcode: organizationAddressZipcode,
          taxCode: organizationEIN
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const enrollmentStatus = responseJSON;
          if (enrollmentStatus === 'SUCCESSFUL_ENROLLMENT') {
            this.setState({ submitSuccessful: true });
            alert('Thank you for Submitting. Please wait 1-3 business days for a response.');
          } else if (enrollmentStatus === 'USER_ALREADY_EXISTS') {
            alert('User already exists');
          } else if (enrollmentStatus === 'ORG_EXISTS') {
            alert('Organization already exists');
          } else {
            alert('Server Failure: Please Try Again');
          }
        });
    }
  }

  handleChangeOrganizationName(event: any) {
    this.setState({ organizationName: event.target.value });
  }

  handleChangeOrganizationStatus(event: any) {
    this.setState({ organizationStatus: event.target.value });
  }

  handleChangeOrganizationWebsite(event: any) {
    this.setState({ organizationWebsite: event.target.value });
  }

  handleChangeOrganizationEIN(event: any) {
    this.setState({ organizationEIN: event.target.value });
  }

  handleChangeFirstName(event: any) {
    this.setState({ firstName: event.target.value });
  }

  handleChangeLastName(event: any) {
    this.setState({ lastName: event.target.value });
  }

  handleChangeContactEmail(event: any) {
    this.setState({ contactEmail: event.target.value });
  }

  handleChangeContactPhoneNumber(event: any) {
    this.setState({ contactPhoneNumber: event.target.value });
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

  handleChangeAcceptEULA(acceptEULA: boolean) {
    this.setState({ acceptEULA });
  }

  handleChangeReaffirmStage(event: any) {
    event.preventDefault();
    const {
      password,
      confirmPassword,
      reaffirmStage,
    } = this.state;
    if (password !== confirmPassword) {
      alert('Your Passwords are not Identical');
    } else {
      this.setState({ reaffirmStage: !reaffirmStage });
    }
  }

  handleChangeUsername(event: any) {
    this.setState({ username: event.target.value });
  }

  handleChangePassword(event: any) {
    this.setState({ password: event.target.value });
  }

  handleChangeConfirmPassword(event: any) {
    this.setState({ confirmPassword: event.target.value });
  }

  render() {
    const {
      organizationWebsite,
      firstName,
      lastName,
      contactPhoneNumber,
      organizationName,
      organizationStatus,
      contactEmail,
      username,
      password,
      confirmPassword,
      organizationAddressStreet,
      organizationAddressCity,
      organizationAddressState,
      organizationAddressZipcode,
      organizationEIN,
      acceptEULA,
      submitSuccessful,
      reaffirmStage,
    } = this.state;

    const organizationFormHeader = !reaffirmStage ? 'Organization Signup Form' : 'Finish Organization Signup';
    const organizationFormBody = !reaffirmStage
      ? 'Thank you for expressing interest in using Keep.id to empower the homeless population. Please fill out the following form so we can get back to you with instructions on how to proceed. The contact should be the organization leader who will control the privileges of all users of the service.'
      : 'Please check the information below for accuracy and read and sign the EULA below to indicate your consent to the EULA.';
    const organizationForm = (
      <div className="container">
        <Helmet>
          <title>Organization Signup</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-12">
            <div className="jumbotron jumbotron-fluid bg-white pb-2 mb-2">
              <div className="container">
                <h1 className="display-5 text-center font-weight-bold mb-3">{organizationFormHeader}</h1>
                <p className="lead">{organizationFormBody}</p>
              </div>
            </div>
            <form onSubmit={this.handleChangeReaffirmStage}>
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
                      <input type="url" readOnly={reaffirmStage} className="form-control form-purple" id="inputOrgWebsite" placeholder="https://www.keep.id" value={organizationWebsite} onChange={this.handleChangeOrganizationWebsite} />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputContactEmail" className="w-100 pr-3">
                      Contact Email Address
                      <span className="red-star">*</span>
                      <input type="email" readOnly={reaffirmStage} className="form-control form-purple" id="inputContactEmail" placeholder="contact@example.com" value={contactEmail} onChange={this.handleChangeContactEmail} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputFirstName" className="w-100 pr-3">
                      Contact First Name
                      <span className="red-star">*</span>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputFirstName" placeholder="John" value={firstName} onChange={this.handleChangeFirstName} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputLastName" className="w-100 pr-3">
                      Contact Last Name
                      <span className="red-star">*</span>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputLastName" placeholder="Smith" value={lastName} onChange={this.handleChangeLastName} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputContactPhoneNumber" className="w-100 pr-3">
                      Contact Phone Number
                      <span className="red-star">*</span>
                      <input type="tel" readOnly={reaffirmStage} className="form-control form-purple" id="inputContactPhoneNumber" placeholder="1-(234)-567-8901" value={contactPhoneNumber} onChange={this.handleChangeContactPhoneNumber} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputUsername" className="w-100 pr-3">
                      Admin Username
                      <span className="red-star">*</span>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputUsername" placeholder="John Doe" value={username} onChange={this.handleChangeUsername} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputPassword" className="w-100 pr-3">
                      Password
                      <span className="red-star">*</span>
                      <input type="password" readOnly={reaffirmStage} className="form-control form-purple" id="inputPassword" placeholder="*******" value={password} onChange={this.handleChangePassword} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputConfirmpassword" className="w-100 pr-3">
                      Confirm Password
                      <span className="red-star">*</span>
                      <input type="password" readOnly={reaffirmStage} className="form-control form-purple" id="inputConfirmPassword" placeholder="********" value={confirmPassword} onChange={this.handleChangeConfirmPassword} required />
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
                        {USStates.map((USState) => (<option>{USState.abbreviation}</option>))}
                      </select>
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputZipCode" className="w-100 pr-3">
                      Zip Code
                      <span className="red-star">*</span>
                      <input readOnly={reaffirmStage} type="text" className="form-control form-purple" id="inputZipCode" placeholder="19104" value={organizationAddressZipcode} onChange={this.handleChangeOrganizationAddressZipcode} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputEIN" className="w-100 pr-3">
                      Employer Identification Number
                      <span className="red-star">*</span>
                      <input readOnly={reaffirmStage} type="text" className="form-control form-purple" id="inputEIN" placeholder="12-3456789" value={organizationEIN} onChange={this.handleChangeOrganizationEIN} required />
                    </label>
                  </div>
                  {!reaffirmStage
                    ? (
                      <div className="col mt-3 pl-5 pt-2">
                        <input type="submit" className="btn btn-primary w-50" value="Continue" />
                      </div>
                    ) : <div />}
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
        <div className="row mt-5 mb-auto">
          <span className="border">
            <SignaturePad acceptEULA={acceptEULA} handleChangeAcceptEULA={this.handleChangeAcceptEULA} />
          </span>
        </div>
        <div className="row mt-5">
          <div className="col-md-6">
            <ReCAPTCHA
              sitekey="6LdC2doUAAAAAOPR99_VV97ifNVQiF7I3RQOTc8T"
              onChange={this.captchaVerify}
            />
          </div>
          <div className="col-md-6 text-right">
            <button type="button" onClick={this.handleChangeReaffirmStage} className="btn btn-danger mr-4">Back</button>
            <button type="button" onClick={this.handleSubmit} className="btn btn-success">Submit</button>
          </div>
        </div>
      </div>
    );
  }
}

export default OrganizationSignup;
