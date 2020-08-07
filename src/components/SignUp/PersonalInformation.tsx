import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import USStates from '../../static/data/states_titlecase.json';
import {isValidAddress, isValidBirthDate, isValidCity, isValidEmail, isValidOrgWebsite,
  isValidPhoneNumber, isValidUSState, isValidZipCode} from '../../lib/Validations/Validations';

interface Props {
  firstname: string,
  lastname: string,
  birthDate: string,
  address: string,
  city: string,
  state: string,
  zipcode: string,
  phonenumber: string,
  email: string,
  onChangeFirstname: () => void,
  onChangeLastname: () => void,
  onChangeBirthDate: (e) => void,
  onChangeAddress: () => void,
  onChangeCity: () => void,
  onChangeState: () => void,
  onChangeZipcode: () => void,
  onChangePhoneNumber: () => void,
  onChangeEmail: () => void,
  handleContinue: () => void,
  handlePrevious: ()=> void,
  alert: any
}

interface State {
  firstnameValidator: string,
  lastnameValidator: string,
  birthDateValidator: string,
  addressValidator: string,
  cityValidator: string,
  stateValidator: string,
  zipcodeValidator: string,
  phonenumberValidator: string,
  emailValidator: string,
}

class PersonalInformation extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      firstnameValidator: '',
      lastnameValidator: '',
      birthDateValidator: '',
      addressValidator: '',
      cityValidator: '',
      stateValidator: '',
      zipcodeValidator: '',
      phonenumberValidator: '',
      emailValidator: '',
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
        <div className="valid-feedback" />
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

  validateFirstname = async ():Promise<void> => {
    const { firstname } = this.props;
    // ( if firstname is valid here)
    if (firstname) {
      await new Promise((resolve) => this.setState({ firstnameValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ firstnameValidator: 'false' }, resolve));
    }
  }

  validateLastname = async ():Promise<void> => {
    const { lastname } = this.props;
    // ( if lastname is valid here)
    if (lastname) {
      await new Promise((resolve) => this.setState({ lastnameValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ lastnameValidator: 'false' }, resolve));
    }
  }

  validateBirthdate = async ():Promise<void> => {
    const { birthDate } = this.props;
    // ( if birthDate is valid here)
    if (isValidBirthDate(birthDate)) {
      await new Promise((resolve) => this.setState({ birthDateValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ birthDateValidator: 'false' }, resolve));
    }
  }

  validateAddress = async ():Promise<void> => {
    const { address } = this.props;
    // ( if address is valid here)
    if (isValidAddress(address)) {
      await new Promise((resolve) => this.setState({ addressValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ addressValidator: 'false' }, resolve));
    }
  }

  validateCity = async ():Promise<void> => {
    const { city } = this.props;
    // ( if password is valid here)
    if (isValidCity(city)) {
      await new Promise((resolve) => this.setState({ cityValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ cityValidator: 'false' }, resolve));
    }
  }

  validateState = async ():Promise<void> => {
    const { state } = this.props;
    // ( if state is valid here)
    if (isValidUSState(state)) {
      await new Promise((resolve) => this.setState({ stateValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ stateValidator: 'false' }, resolve));
    }
  }

  validateZipcode = async ():Promise<void> => {
    const { zipcode } = this.props;
    // ( if zipcode is valid here)
    if (isValidZipCode(zipcode)) {
      await new Promise((resolve) => this.setState({ zipcodeValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ zipcodeValidator: 'false' }, resolve));
    }
  }

  validatePhonenumber = async ():Promise<void> => {
    const { phonenumber } = this.props;
    // ( if phonenumber is valid here)
    if (isValidPhoneNumber(phonenumber)) {
      await new Promise((resolve) => this.setState({ phonenumberValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ phonenumberValidator: 'false' }, resolve));
    }
  }

  validateEmail = async ():Promise<void> => {
    const { email } = this.props;
    // ( if email is valid here)
    if (isValidEmail(email)) {
      await new Promise((resolve) => this.setState({ emailValidator: 'true' }, resolve));
    } else {
      await new Promise((resolve) => this.setState({ emailValidator: 'false' }, resolve));
    }
  }

  customOnChangeBirthDate = (e) => {
    this.props.onChangeBirthDate(e);
    this.validateBirthdate();
  }

  handleStepPrevious = (e) => {
    e.preventDefault();
    this.props.handlePrevious();
  }

  handleStepComplete = async (e) => {
    e.preventDefault();
    await Promise.all([this.validateFirstname(), this.validateLastname(), this.validateEmail(), this.validateBirthdate(),
      this.validateAddress(), this.validateCity(), this.validateState(), this.validateZipcode(), this.validatePhonenumber()]);
    const {
      firstnameValidator, lastnameValidator, birthDateValidator, addressValidator, cityValidator, stateValidator, zipcodeValidator, phonenumberValidator, emailValidator,
    } = this.state;
    if (firstnameValidator === 'true'
        && lastnameValidator === 'true'
        && birthDateValidator === 'true'
        && addressValidator === 'true'
        && cityValidator === 'true'
        && stateValidator === 'true'
        && zipcodeValidator === 'true'
        && emailValidator === 'true'
        && phonenumberValidator === 'true') {
      this.props.handleContinue();
    } else {
      this.props.alert.show('One or more fields are invalid');
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const {
      firstnameValidator,
      lastnameValidator,
      birthDateValidator,
      addressValidator,
      cityValidator,
      stateValidator,
      zipcodeValidator,
      phonenumberValidator,
      emailValidator,
    } = this.state;
    const {
      firstname,
      lastname,
      birthDate,
      address,
      city,
      state,
      zipcode,
      phonenumber,
      email,
      onChangeFirstname,
      onChangeLastname,
      onChangeAddress,
      onChangeCity,
      onChangeState,
      onChangeZipcode,
      onChangePhoneNumber,
      onChangeEmail,
    } = this.props;
    return (
      <div>
        <Helmet>
          <title>
            Sign Up- Personal Info
          </title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="d-flex justify-content-center pt-5">
          <div className="col-md-10">
            <div className="text-center pb-4 mb-2">
              <h2><b>Next, tell us about yourself</b></h2>
            </div>
            <form onSubmit={this.handleStepComplete}>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label text-sm-right">Name</label>
                <div className="col-sm-4 pb-2">
                  <label htmlFor="firstname" className="sr-only sr-only-focusable">First Name</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(firstnameValidator)}`}
                    placeholder="First Name"
                    id="firstname"
                    value={firstname}
                    onChange={onChangeFirstname}
                    onBlur={this.validateFirstname}
                  />
                  {this.generalMessage(firstnameValidator)}
                </div>
                <div className="col-sm-5">
                  <label htmlFor="lastname" className="sr-only sr-only-focusable">Last Name</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(lastnameValidator)}`}
                    placeholder="Last Name"
                    id="lastname"
                    value={lastname}
                    onChange={onChangeLastname}
                    onBlur={this.validateLastname}
                  />
                  {this.generalMessage(lastnameValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="birthDate" className="col-sm-3 col-form-label text-sm-right">Birth Date</label>
                <div className="col-sm-9">
                  <DatePicker
                    id="birthDate"
                    onChange={this.customOnChangeBirthDate}
                    onBlur={this.validateBirthdate}
                    selected={birthDate}
                    className={`form-control form-purple ${this.colorToggle(birthDateValidator)}`}

                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label text-sm-right">Mailing Address</label>
                <div className="col-sm-9">
                  <label htmlFor="streetAddress" className="sr-only sr-only-focusable">Street Address</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(addressValidator)}`}
                    id="streetAddress"
                    placeholder="Street Address"
                    value={address}
                    onChange={onChangeAddress}
                    onBlur={this.validateAddress}

                  />
                  {this.generalMessage(addressValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label invisible" />
                <div className="col-sm-3 mb-3 mb-sm-0">
                  <label htmlFor="city" className="sr-only sr-only-focusable">City</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(cityValidator)}`}
                    id="city"
                    placeholder="City"
                    value={city}
                    onChange={onChangeCity}
                    onBlur={this.validateCity}

                  />
                  {this.generalMessage(cityValidator)}
                </div>
                <div className="col-sm-3 mb-3 mb-sm-0">
                  <label htmlFor="state" className="sr-only sr-only-focusable">State</label>
                  <select
                    className={`form-control form-purple ${this.colorToggle(stateValidator)}`}
                    id="state"
                    value={state}
                    onChange={onChangeState}
                    onBlur={this.validateState}

                  >
                    {USStates.map((USState) => (<option key={USState.abbreviation}>{USState.abbreviation}</option>))}
                  </select>
                  {this.generalMessage(stateValidator)}
                </div>
                <div className="col-sm-3">
                  <label htmlFor="zipcode" className="sr-only sr-only-focusable">Zipcode</label>
                  <input
                    type="number"
                    className={`form-control form-purple ${this.colorToggle(zipcodeValidator)}`}
                    id="zipcode"
                    placeholder="Zipcode"
                    value={zipcode}
                    onChange={onChangeZipcode}
                    onBlur={this.validateZipcode}

                  />
                  {this.generalMessage(zipcodeValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="phonenumber" className="col-sm-3 col-form-label text-sm-right">Phone number</label>
                <div className="col-sm-9">
                  <input
                    type="tel"
                    className={`form-control form-purple ${this.colorToggle(phonenumberValidator)}`}
                    id="phonenumber"
                    placeholder="Phone number"
                    value={phonenumber}
                    onChange={onChangePhoneNumber}
                    onBlur={this.validatePhonenumber}

                  />
                  {this.generalMessage(phonenumberValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="email" className="col-sm-3 col-form-label text-sm-right">Email address</label>
                <div className="col-sm-9">
                  <input
                    type="email"
                    className={`form-control form-purple ${this.colorToggle(emailValidator)}`}
                    id="email"
                    placeholder="Email address"
                    value={email}
                    onChange={onChangeEmail}
                    onBlur={this.validateEmail}

                  />
                  {this.generalMessage(emailValidator)}
                </div>
              </div>

              <div className="d-flex">
                <button type="button" className="btn btn-outline-danger mt-5" onClick={this.handleStepPrevious}>Previous Step</button>
                <button type="submit" className="ml-auto btn btn-primary mt-5" onSubmit={this.handleStepComplete}>Continue</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(PersonalInformation);
