import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import USStates from '../static/data/states_titlecase.json';
import SignaturePad from '../lib/react-typescript-signature-pad';

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
  organizationAddressLine1: string,
  organizationAddressLine2: string,
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
    console.log(USStates);
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
      organizationAddressLine1: '',
      organizationAddressLine2: '',
      organizationAddressCity: '',
      organizationAddressState: USStates[0].name,
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
    this.handleChangeOrganizationAddressLine1 = this.handleChangeOrganizationAddressLine1.bind(this);
    this.handleChangeOrganizationAddressLine2 = this.handleChangeOrganizationAddressLine2.bind(this);
    this.handleChangeOrganizationAddressCity = this.handleChangeOrganizationAddressCity.bind(this);
    this.handleChangeOrganizationAddressState = this.handleChangeOrganizationAddressState.bind(this);
    this.handleChangeOrganizationAddressZipcode = this.handleChangeOrganizationAddressZipcode.bind(this);
    this.handleChangeReaffirmStage = this.handleChangeReaffirmStage.bind(this);
    this.handleChangeAcceptEULA = this.handleChangeAcceptEULA.bind(this);
  }

  handleSubmit(event: any) {
    if (!this.state.acceptEULA) {
      alert('Please accept EULA before completing application');
    } else {
      alert('Thank you for Submitting. Please wait 1-3 business days for a response.');
      fetch('http://localhost:7000/organization-signup', {
        method: 'POST',
        body: JSON.stringify({
          orgWebsite: this.state.organizationWebsite,
          name: this.state.contactName,
          phone: this.state.contactPhoneNumber,
          orgName: this.state.organizationName,
          email: this.state.contactEmail,
          username: this.state.username,
          password: this.state.password,
          address: this.state.organizationAddressLine1,
          city: this.state.organizationAddressCity,
          state: this.state.organizationAddressState,
          zipcode: this.state.organizationAddressZipcode,
          taxCode: this.state.organizationEIN,
          numUsers: this.state.organizationNumClients,
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON === 'SUCCESSFUL_ENROLLMENT') {
            this.setState({ submitSuccessful: true });
          } else if (responseJSON === 'USER_ALREADY_EXISTS') {
            alert('User already exists');
          } else if (responseJSON === 'ORG_ALREADY_EXISTS') {
            alert('Organization already exists');
          } else {
            alert('Server Failure: Please Try Again');
          }
        });
    }
  }

  handleChangeOrganizationName(event: any) {
    console.log(event);
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

  handleChangeOrganizationAddressLine1(event: any) {
    this.setState({ organizationAddressLine1: event.target.value });
  }

  handleChangeOrganizationAddressLine2(event: any) {
    this.setState({ organizationAddressLine2: event.target.value });
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

  handleChangeAcceptEULA(accept: boolean) {
    this.setState({ acceptEULA: accept });
  }

  handleChangeReaffirmStage(event: any) {
    event.preventDefault();
    if (this.state.password !== this.state.confirmPassword) {
      alert('Your Passwords are not Identical');
    } else {
      this.setState({ reaffirmStage: !this.state.reaffirmStage });
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
    if (this.state.submitSuccessful) {
      return (<Redirect to="/" />);
    }
    if (!this.state.reaffirmStage) {
      return (
        <div className="container">
          <div className="row">
            <div className="col-md-12 mt-5">
              <h3 className="text-center textPrintHeader">
                    Organization Signup Page
              </h3>
              <p className="textPrintDesc pl-3">
                <span>
  Thank you for expressing interest in using Keep.id in the fight to end homelessness.
                   Please fill out the following form so we can get back to you with instructions on how to proceed.
                   The contact should be the organization leader who will control the priviledges of all users of the service.
                </span>
              </p>
              <form onSubmit={this.handleChangeReaffirmStage}>
                <div className="col-md-12">
                  <div className="form-row">
                    <div className="col-md-6 form-group">
                      <label htmlFor="inputOrgName">
  Organization Name
                        <text className="red-star">*</text>
                      </label>
                      <input type="text" className="form-control form-purple" id="orgName" placeholder="Keep" value={this.state.organizationName} onChange={this.handleChangeOrganizationName} required />
                    </div>
                    <div className="col-md-6 form-group">
                      <label htmlFor="inputOrgWebsite">Organization Website</label>
                      <input type="url" className="form-control form-purple" id="orgWebsite" placeholder="https://www.keep.id" value={this.state.organizationWebsite} onChange={this.handleChangeOrganizationWebsite} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-md-4 form-group">
                      <label htmlFor="inputContactName">
  Contact Name
                        <text className="red-star">*</text>
                      </label>
                      <input type="text" className="form-control form-purple" id="contactName" placeholder="John Doe" value={this.state.contactName} onChange={this.handleChangeContactName} required />
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="inputContactPhoneNumber">
  Contact Phone Number
                        <text className="red-star">*</text>
                      </label>
                      <input type="tel" className="form-control form-purple" id="contactPhoneNumber" placeholder="1-(234)-567-8901" value={this.state.contactPhoneNumber} onChange={this.handleChangeContactPhoneNumber} required />
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="inputContactEmail">
  Contact Email Address
                        <text className="red-star">*</text>
                      </label>
                      <input type="email" className="form-control form-purple" id="contactEmail" placeholder="contact@example.com" value={this.state.contactEmail} onChange={this.handleChangeContactEmail} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-md-4 form-group">
                      <label htmlFor="username">
Admin Username
                        <text className="red-star">*</text>
                      </label>
                      <input type="password" className="form-control form-purple" id="username" placeholder="John Doe" value={this.state.username} onChange={this.handleChangeUsername} required />
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="password">
Password
                        <text className="red-star">*</text>
                      </label>
                      <input type="password" className="form-control form-purple" id="password" placeholder="*******" value={this.state.password} onChange={this.handleChangePassword} required />
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="confirmpassword">
Confirm Password
                        <text className="red-star">*</text>
                      </label>
                      <input type="text" className="form-control form-purple" id="confirmpassword" placeholder="********" value={this.state.confirmPassword} onChange={this.handleChangeConfirmPassword} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-md-4 form-group">
                      <label htmlFor="inputAddress">
  Organization Address
                        <text className="red-star">*</text>
                      </label>
                      <input type="text" className="form-control form-purple" id="address" placeholder="311 Broad St" value={this.state.organizationAddressLine1} onChange={this.handleChangeOrganizationAddressLine1} required />
                    </div>
                    <div className="col-md-3 form-group">
                      <label htmlFor="inputCity">
  City
                        <text className="red-star">*</text>
                      </label>
                      <input type="text" className="form-control form-purple" id="city" placeholder="Philadelphia" value={this.state.organizationAddressCity} onChange={this.handleChangeOrganizationAddressCity} required />
                    </div>
                    <div className="col-md-2 form-group">
                      <label htmlFor="inputState">
  State
                        <text className="red-star">*</text>
                      </label>
                      <select className="form-control form-purple" id="state" value={this.state.organizationAddressState} onChange={this.handleChangeOrganizationAddressState} required>
                        {USStates.map((USState) => (<option>{USState.name}</option>))}
                      </select>
                    </div>
                    <div className="col-md-3 form-group">
                      <label htmlFor="inputZipCode">
  Zip Code
                        <text className="red-star">*</text>
                      </label>
                      <input type="text" className="form-control form-purple" id="zipCode" placeholder="19104" value={this.state.organizationAddressZipcode} onChange={this.handleChangeOrganizationAddressZipcode} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="col-md-4 form-group">
                      <label htmlFor="inputEIN">
  Organization Employer Identification Number
                        <text className="red-star">*</text>
                        {' '}

                      </label>
                      <input type="text" className="form-control form-purple" id="ein" placeholder="12-3456789" value={this.state.organizationEIN} onChange={this.handleChangeOrganizationEIN} required />
                    </div>
                    <div className="col-md-4 form-group">
                      <label htmlFor="inputNumUsers">
  Expected Number of Users in 100s
                        <text className="red-star">*</text>
                      </label>

                      <input type="number" className="form-control form-purple" id="numUsers" min="0" step="100" placeholder="1000" value={this.state.organizationNumClients} onChange={this.handleChangeOrganizationNumClients} required />
                    </div>
                    <div className="col-auto mt-4 pt-2">
                      <button type="submit" className="btn btn-primary">Continue</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="container">
          <div className="row">
            <div className="col-md-12 mt-5">
              <h3 className="text-center textPrintHeader">
                    Review Your Information
              </h3>
              <p className="textPrintDesc pl-3">
                <span>This is just to check if you have filled out all the fields correctly.</span>
              </p>
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="inputOrgName">Organization Name</label>
                    <input type="text" readOnly className="form-control form-purple" id="orgName" value={this.state.organizationName} />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="inputOrgWebsite">Organization Website</label>
                    <input type="url" readOnly className="form-control form-purple" id="orgWebsite" value={this.state.organizationWebsite} />
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-md-4">
                    <label htmlFor="inputContactName">Contact Name</label>
                    <input type="text" readOnly className="form-control form-purple" id="contactName" value={this.state.contactName} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="inputContactPhoneNumber">Contact Phone Number</label>
                    <input type="tel" readOnly className="form-control form-purple" id="contactPhoneNumber" value={this.state.contactPhoneNumber} />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="inputContactEmail">Contact Email Address</label>
                    <input type="email" readOnly className="form-control form-purple" id="contactEmail" value={this.state.contactEmail} />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="col-md-4 form-group">
                  <label htmlFor="username">
Admin Username
                    <text className="red-star">*</text>
                  </label>
                  <input type="text" readOnly className="form-control form-purple" id="username" value={this.state.username} required />
                </div>
                <div className="col-md-4 form-group">
                  <label htmlFor="password">
Password
                    <text className="red-star">*</text>
                  </label>
                  <input type="text" readOnly className="form-control form-purple" id="password" value={this.state.password} required />
                </div>
                <div className="col-md-4 form-group">
                  <label htmlFor="confirmpassword">
Confirm Password
                    <text className="red-star">*</text>
                  </label>
                  <input type="text" readOnly className="form-control form-purple" id="confirmpassword" value={this.state.confirmPassword} required />
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-md-4">
                  <label htmlFor="inputAddress">Organization Address</label>
                  <input type="text" readOnly className="form-control form-purple" id="address" value={this.state.organizationAddressLine1} />
                </div>
                <div className="col-md-3">
                  <label htmlFor="inputCity">City</label>
                  <input type="text" readOnly className="form-control form-purple" id="city" value={this.state.organizationAddressCity} />
                </div>
                <div className="col-md-2">
                  <label htmlFor="inputState">State</label>
                  <input type="text" readOnly className="form-control form-purple" id="state" value={this.state.organizationAddressState} />
                </div>
                <div className="col-md-3">
                  <label htmlFor="inputZipCode">Zip Code</label>
                  <input type="number" readOnly className="form-control form-purple" id="zipCode" value={this.state.organizationAddressZipcode} />
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-md-4">
                  <label htmlFor="inputEIN">Organization Employer Identification Number </label>
                  <input type="password" readOnly className="form-control form-purple" id="ein" value={this.state.organizationEIN} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="inputNumUsers">Expected Number of Users</label>
                  <input type="number" readOnly className="form-control form-purple" id="numUsers" value={this.state.organizationNumClients} />
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <SignaturePad acceptEULA={this.state.acceptEULA} handleChangeAcceptEULA={this.handleChangeAcceptEULA} />
          </span>
        </div>
        <div className="row mt-5">
          <div className="col-md-6">
            <p> Need API key for ReCaptcha, which requires domain name</p>
          </div>
          <div className="col-md-6 text-right">
            <button onClick={this.handleChangeReaffirmStage} className="btn btn-primary">Back</button>
            <button onClick={this.handleSubmit} className="btn btn-primary">Submit</button>
          </div>
        </div>
      </div>
    );
  }
}

export default OrganizationSignup;
