import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import USStates from '../static/data/states_titlecase.json';
import SignaturePad from '../lib/react-typescript-signature-pad';
import getServerURL from '../serverOverride';

// Need to validate form to make sure inputs are good, address is good, etc.
// Google API for address checking

interface State {
  submitSuccessful: boolean,
  organizationName: string,
  organizationStatus: string,
  organizationWebsite: string,
  organizationEIN: string,
  organizationNumClients: number,
  contactName: string,
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
      organizationNumClients: 0, // ${NumClientOptions[0][0]}-${NumClientOptions[0][1]}`,
      organizationEIN: '',
      contactName: '',
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
    this.handleChangeOrganizationNumClients = this.handleChangeOrganizationNumClients.bind(this);
    this.handleChangeOrganizationEIN = this.handleChangeOrganizationEIN.bind(this);
    this.handleChangeContactName = this.handleChangeContactName.bind(this);
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
  }

  handleSubmit(event: any) {
    const {
      organizationWebsite,
      contactName,
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
      organizationNumClients,
      acceptEULA,
    } = this.state;
    if (!acceptEULA) {
      alert('Please accept EULA before completing application');
    } else {
      alert('Thank you for Submitting. Please wait 1-3 business days for a response.');
      fetch(`${getServerURL()}/organization-signup`, {
        method: 'POST',
        body: JSON.stringify({
          orgWebsite: organizationWebsite,
          name: contactName,
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
          taxCode: organizationEIN,
          numUsers: organizationNumClients,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON === 'SUCCESSFUL_ENROLLMENT') {
            this.setState({ submitSuccessful: true });
          } else if (responseJSON === 'USER_ALREADY_EXISTS') {
            alert('User already exists');
          } else if (responseJSON === 'ORG_EXISTS') {
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

  handleChangeOrganizationNumClients(event: any) {
    this.setState({ organizationNumClients: event.target.value });
  }

  handleChangeContactName(event: any) {
    this.setState({ contactName: event.target.value });
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
      contactName,
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
      organizationNumClients,
      acceptEULA,
      submitSuccessful,
      reaffirmStage,
    } = this.state;

    const organizationFormHeader = !reaffirmStage ? 'Organization Signup Form' : 'Finish Organization Signup';
    const organizationFormBody = !reaffirmStage
      ? 'Thank you for expressing interest in using Keep.id in the fight to end homelessness. Please fill out the following form so we can get back to you with instructions on how to proceed. The contact should be the organization leader who will control the privileges of all users of the service.'
      : 'Please check information and sign and submit your form.';
    const organizationForm = (
      <div className="container">
        <div className="row">
          <div className="col-md-12 mt-5">
            <h3 className="text-center textPrintHeader">
              {organizationFormHeader}
            </h3>
            <p className="textPrintDesc pl-3">
              <span>
                {organizationFormBody}
              </span>
            </p>
            <form onSubmit={this.handleChangeReaffirmStage}>
              <div className="col-md-12">
                <div className="form-row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="inputOrgName">
                      Organization Name
                      <text className="red-star">*</text>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputOrgName" placeholder="Keep" value={organizationName} onChange={this.handleChangeOrganizationName} required />
                    </label>
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="inputOrgWebsite">
                      Organization Website
                      <input type="url" readOnly={reaffirmStage} className="form-control form-purple" id="inputOrgWebsite" placeholder="https://www.keep.id" value={organizationWebsite} onChange={this.handleChangeOrganizationWebsite} />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputContactName">
                      Contact Name
                      <text className="red-star">*</text>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputContactName" placeholder="John Doe" value={contactName} onChange={this.handleChangeContactName} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputContactPhoneNumber">
                      Contact Phone Number
                      <text className="red-star">*</text>
                      <input type="tel" readOnly={reaffirmStage} className="form-control form-purple" id="inputContactPhoneNumber" placeholder="1-(234)-567-8901" value={contactPhoneNumber} onChange={this.handleChangeContactPhoneNumber} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputContactEmail">
                      Contact Email Address
                      <text className="red-star">*</text>
                      <input type="email" readOnly={reaffirmStage} className="form-control form-purple" id="inputContactEmail" placeholder="contact@example.com" value={contactEmail} onChange={this.handleChangeContactEmail} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputUsername">
                      Admin Username
                      <text className="red-star">*</text>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputUsername" placeholder="John Doe" value={username} onChange={this.handleChangeUsername} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputPassword">
                      Password
                      <text className="red-star">*</text>
                      <input type="password" readOnly={reaffirmStage} className="form-control form-purple" id="inputPassword" placeholder="*******" value={password} onChange={this.handleChangePassword} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputConfirmpassword">
                      Confirm Password
                      <text className="red-star">*</text>
                      <input type="password" readOnly={reaffirmStage} className="form-control form-purple" id="inputConfirmPassword" placeholder="********" value={confirmPassword} onChange={this.handleChangeConfirmPassword} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputAddress">
                      Organization Address
                      <text className="red-star">*</text>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputAddress" placeholder="311 Broad St" value={organizationAddressStreet} onChange={this.handleChangeOrganizationAddressStreet} required />
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputCity">
                      City
                      <text className="red-star">*</text>
                      <input type="text" readOnly={reaffirmStage} className="form-control form-purple" id="inputCity" placeholder="Philadelphia" value={organizationAddressCity} onChange={this.handleChangeOrganizationAddressCity} required />
                    </label>
                  </div>
                  <div className="col-md-2 form-group">
                    <label htmlFor="inputState">
                      State
                      <text className="red-star">*</text>
                      <select disabled={reaffirmStage} className="form-control form-purple" id="inputState" value={organizationAddressState} onChange={this.handleChangeOrganizationAddressState} required>
                        {USStates.map((USState) => (<option>{USState.abbreviation}</option>))}
                      </select>
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputZipCode">
                      Zip Code
                      <text className="red-star">*</text>
                      <input readOnly={reaffirmStage} type="text" className="form-control form-purple" id="inputZipCode" placeholder="19104" value={organizationAddressZipcode} onChange={this.handleChangeOrganizationAddressZipcode} required />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputEIN">
                      Organization Employer Identification Number
                      <text className="red-star">*</text>
                      <input readOnly={reaffirmStage} type="text" className="form-control form-purple" id="inputEIN" placeholder="12-3456789" value={organizationEIN} onChange={this.handleChangeOrganizationEIN} required />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputNumUsers">
                      Expected Number of Users in 100s
                      <text className="red-star">*</text>
                      <input readOnly={reaffirmStage} type="number" className="form-control form-purple" id="inputNumUsers" min="0" step="100" placeholder="1000" value={organizationNumClients} onChange={this.handleChangeOrganizationNumClients} required />
                    </label>
                  </div>
                </div>
                {!reaffirmStage
                  ? (
                    <div className="col-auto mt-4 pt-2">
                      <input type="submit" className="btn btn-primary" value="Continue" />
                    </div>
                  ) : <div />}
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
      <div>
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
            <span>I Agree and Sign</span>
          </p>
        </div>
        <div className="row mt-5 mb-auto">
          <span className="border">
            <SignaturePad acceptEULA={acceptEULA} handleChangeAcceptEULA={this.handleChangeAcceptEULA} />
          </span>
        </div>
        <div className="row mt-5">
          <div className="col-md-6">
            <p> Need API key for ReCaptcha, which requires domain name</p>
          </div>
          <div className="col-md-6 text-right">
            <button type="button" onClick={this.handleChangeReaffirmStage} className="btn btn-primary">Back</button>
            <button type="button" onClick={this.handleSubmit} className="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>
    );
  }
}

export default OrganizationSignup;
