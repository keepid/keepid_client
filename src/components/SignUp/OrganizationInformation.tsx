import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import USStates from '../../static/data/states_titlecase.json';
import {isValidAddress, isValidCity, isValidEmail, isValidOrgWebsite,
  isValidPhoneNumber, isValidUSState, isValidZipCode} from '../../lib/Validations/Validations';
  
interface Props {
  orgName: string,
  orgWebsite: string,
  ein: string,
  orgAddress: string,
  orgCity: string,
  orgState: string,
  orgZipcode: string,
  orgPhoneNumber: string,
  orgEmail: string,
  onChangeOrgName: () => void,
  onChangeOrgWebsite: () => void,
  onChangeOrgEIN: (e) => void,
  onChangeOrgAddress: () => void,
  onChangeOrgCity: () => void,
  onChangeOrgState: () => void,
  onChangeOrgZipcode: () => void,
  onChangeOrgPhoneNumber: () => void,
  onChangeOrgEmail: () => void,
  handleContinue: () => void,
  handlePrevious: ()=> void,
  alert: any
}

interface State {
  orgNameValidator: string,
  orgWebsiteValidator: string,
  einValidator: string,
  orgAddressValidator: string,
  orgCityValidator: string,
  orgStateValidator: string,
  orgZipcodeValidator: string,
  orgPhoneNumberValidator: string,
  orgEmailValidator: string,
}

class OrganizationInformation extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      orgNameValidator: '',
      orgWebsiteValidator: '',
      einValidator: '',
      orgAddressValidator: '',
      orgCityValidator: '',
      orgStateValidator: '',
      orgZipcodeValidator: '',
      orgPhoneNumberValidator: '',
      orgEmailValidator: '',
    };
  }

  colorToggle = (inputString: string): string => {
    if (inputString === 'true') {
      return 'is-valid';
    } if (inputString === 'false') {
      return 'is-invalid';
    }
    return '';
  }

  generalMessage = (inputString:string): ReactElement<{}> => {
    if (inputString === 'true') {
      return (
        <div className="valid-feedback">
          Looks Great.
        </div>
      );
    } if (inputString === 'false') {
      return (
        <div className="invalid-feedback">
          Invalid or Blank field.
        </div>
      );
    }
    return (
      <div />
    );
  }

  validateOrgName = async ():Promise<void> => {
    const { orgName } = this.props;
    // ( if orgName is valid here)
    if (orgName) {
      await new Promise((resolve) => this.setState({ orgNameValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgNameValidator: 'false' }, resolve));
    }
  }

  validateOrgWebsite = async ():Promise<void> => {
    const { orgWebsite } = this.props;
    // ( if orgWebsite is valid here)
    if (isValidOrgWebsite(orgWebsite)) {
      await new Promise((resolve) => this.setState({ orgWebsiteValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgWebsiteValidator: 'false' }, resolve));
    }
  }

  validateEIN = async ():Promise<void> => {
    const { ein } = this.props;
    // ( if ein is valid here)
    if (ein) {
      await new Promise((resolve) => this.setState({ einValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ einValidator: 'false' }, resolve));
    }
  }

  validateOrgAddress = async ():Promise<void> => {
    const { orgAddress } = this.props;
    // ( if orgAddress is valid here)
    if (isValidAddress(orgAddress)) {
      await new Promise((resolve) => this.setState({ orgAddressValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgAddressValidator: 'false' }, resolve));
    }
  }

  validateOrgCity = async ():Promise<void> => {
    const { orgCity } = this.props;
    // ( if orgCity is valid here)
    if (isValidCity(orgCity)) {
      await new Promise((resolve) => this.setState({ orgCityValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgCityValidator: 'false' }, resolve));
    }
  }

  validateOrgState = async ():Promise<void> => {
    const { orgState } = this.props;
    // ( if orgState is valid here)
    if (isValidUSState(orgState)) {
      await new Promise((resolve) => this.setState({ orgStateValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgStateValidator: 'false' }, resolve));
    }
  }

  validateOrgZipcode = async ():Promise<void> => {
    const { orgZipcode } = this.props;
    // ( if orgZipcode is valid here)
    if (isValidZipCode(orgZipcode)) {
      await new Promise((resolve) => this.setState({ orgZipcodeValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgZipcodeValidator: 'false' }, resolve));
    }
  }

  validateOrgPhoneNumber = async ():Promise<void> => {
    const { orgPhoneNumber } = this.props;
    // ( if orgPhonenumber is valid here)
    if (isValidPhoneNumber(orgPhoneNumber)) {
      await new Promise((resolve) => this.setState({ orgPhoneNumberValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgPhoneNumberValidator: 'false' }, resolve));
    }
  }

  validateOrgEmail = async ():Promise<void> => {
    const { orgEmail } = this.props;
    // ( if orgEmail is valid here)
    if (isValidEmail(orgEmail)) {
      await new Promise((resolve) => this.setState({ orgEmailValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ orgEmailValidator: 'false' }, resolve));
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  handleStepPrevious = (e) => {
    e.preventDefault();
    this.props.handlePrevious();
  }

  handleStepComplete = async (e) => {
    e.preventDefault();
    await Promise.all([this.validateOrgName(), this.validateOrgWebsite(), this.validateEIN(),
      this.validateOrgAddress(), this.validateOrgCity(), this.validateOrgState(), this.validateOrgZipcode(), this.validateOrgPhoneNumber(), this.validateOrgEmail()]);
    const {
      orgNameValidator, orgWebsiteValidator, einValidator, orgAddressValidator, orgCityValidator, orgStateValidator, orgZipcodeValidator, orgPhoneNumberValidator, orgEmailValidator,
    } = this.state;
    // check if all elements are valid
    if (orgNameValidator === 'true'
    && orgWebsiteValidator === 'true'
    && einValidator === 'true'
    && orgAddressValidator === 'true'
    && orgCityValidator === 'true'
    && orgStateValidator === 'true'
    && orgZipcodeValidator === 'true'
    && orgPhoneNumberValidator === 'true'
    && orgEmailValidator === 'true') {
      this.props.handleContinue();
    } else {
      this.props.alert.show('One or more fields are invalid');
    }
  }

  render() {
    const {
      orgNameValidator,
      orgWebsiteValidator,
      einValidator,
      orgAddressValidator,
      orgCityValidator,
      orgStateValidator,
      orgZipcodeValidator,
      orgPhoneNumberValidator,
      orgEmailValidator,
    } = this.state;
    const {
      orgName,
      orgWebsite,
      ein,
      orgAddress,
      orgCity,
      orgState,
      orgZipcode,
      orgPhoneNumber,
      orgEmail,
      onChangeOrgName,
      onChangeOrgWebsite,
      onChangeOrgEIN,
      onChangeOrgAddress,
      onChangeOrgCity,
      onChangeOrgState,
      onChangeOrgZipcode,
      onChangeOrgPhoneNumber,
      onChangeOrgEmail,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>
            Sign Up- Organization Info
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-10">
            <div className="text-center pb-4 mb-2">
              <h2><b>Next, tell us about your organization.</b></h2>
            </div>
            <form onSubmit={this.handleStepComplete}>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label text-sm-right">Organization name</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(orgNameValidator)}`}
                    placeholder="Organization Name"
                    id="orgName"
                    value={orgName}
                    onChange={onChangeOrgName}
                    onBlur={this.validateOrgName}

                  />
                  {this.generalMessage(orgNameValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="orgWebsite" className="col-sm-3 col-form-label text-sm-right">Organization website</label>
                <div className="col-sm-9">
                  <input
                    type="url"
                    className={`form-control form-purple ${this.colorToggle(orgWebsiteValidator)}`}
                    placeholder="Organization website"
                    id="orgWebsite"
                    value={orgWebsite}
                    onChange={onChangeOrgWebsite}
                    onBlur={this.validateOrgWebsite}

                  />
                  {this.generalMessage(orgWebsiteValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="ein" className="col-sm-3 col-form-label text-sm-right">Organization EIN</label>
                <div className="col-sm-9">
                  <input
                    type="number"
                    className={`form-control form-purple ${this.colorToggle(einValidator)}`}
                    placeholder="Organization EIN"
                    id="ein"
                    value={ein}
                    onChange={onChangeOrgEIN}
                    onBlur={this.validateEIN}

                  />
                  {this.generalMessage(einValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label text-sm-right">Organization Address</label>
                <div className="col-sm-9">
                  <label htmlFor="streetAddress" className="sr-only sr-only-focusable">Street Address</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(orgAddressValidator)}`}
                    id="streetAddress"
                    placeholder="Organization Address"
                    value={orgAddress}
                    onChange={onChangeOrgAddress}
                    onBlur={this.validateOrgAddress}

                  />
                  {this.generalMessage(orgAddressValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label invisible" />
                <div className="col-sm-3 mb-3 mb-sm-0">
                  <label htmlFor="city" className="sr-only sr-only-focusable">City</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(orgCityValidator)}`}
                    id="city"
                    placeholder="City"
                    value={orgCity}
                    onChange={onChangeOrgCity}
                    onBlur={this.validateOrgCity}

                  />
                  {this.generalMessage(orgCityValidator)}
                </div>
                <div className="col-sm-3 mb-3 mb-sm-0">
                  <label htmlFor="state" className="sr-only sr-only-focusable">State</label>
                  <select
                    className={`form-control form-purple ${this.colorToggle(orgStateValidator)}`}
                    id="state"
                    value={orgState}
                    onChange={onChangeOrgState}
                    onBlur={this.validateOrgState}

                  >
                    {USStates.map((USState) => (<option key={USState.abbreviation}>{USState.abbreviation}</option>))}
                  </select>
                  {this.generalMessage(orgStateValidator)}
                </div>
                <div className="col-sm-3">
                  <label htmlFor="zipcode" className="sr-only sr-only-focusable">Zipcode</label>
                  <input
                    type="number"
                    className={`form-control form-purple ${this.colorToggle(orgZipcodeValidator)}`}
                    id="zipcode"
                    placeholder="Zipcode"
                    value={orgZipcode}
                    onChange={onChangeOrgZipcode}
                    onBlur={this.validateOrgZipcode}

                  />
                  {this.generalMessage(orgZipcodeValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="phonenumber" className="col-sm-3 col-form-label text-sm-right">Organization Phone number</label>
                <div className="col-sm-9">
                  <input
                    type="tel"
                    className={`form-control form-purple ${this.colorToggle(orgPhoneNumberValidator)}`}
                    id="phonenumber"
                    placeholder="Organization Phone number"
                    value={orgPhoneNumber}
                    onChange={onChangeOrgPhoneNumber}
                    onBlur={this.validateOrgPhoneNumber}

                  />
                  {this.generalMessage(orgPhoneNumberValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="email" className="col-sm-3 col-form-label text-sm-right">Organization email address</label>
                <div className="col-sm-9">
                  <input
                    type="email"
                    className={`form-control form-purple ${this.colorToggle(orgEmailValidator)}`}
                    id="email"
                    placeholder="Organization email address"
                    value={orgEmail}
                    onChange={onChangeOrgEmail}
                    onBlur={this.validateOrgEmail}

                  />
                  {this.generalMessage(orgEmailValidator)}
                </div>
              </div>
              <div className="d-flex">
                <button type="button" className="btn btn-outline-danger mt-5" onClick={this.handleStepPrevious}>Previous Step</button>

                <button type="button" className="ml-auto btn btn-primary mt-5" onClick={this.handleStepComplete}>Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(OrganizationInformation);
