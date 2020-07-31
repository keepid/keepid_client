import React, { Component, ReactElement } from 'react';
import { Helmet } from 'react-helmet';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import USStates from '../../static/data/states_titlecase.json';

interface Props {
  firstname: string,
  lastname: string,
  birthDate: Date,
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

  validateFirstname = ():void => {
    const { firstname } = this.props;
    // ( if firstname is valid here)
    if (firstname) {
      this.setState({ firstnameValidator: 'true' });
    } else {
      this.setState({ firstnameValidator: 'false' });
    }
  }

  validateLastname = ():void => {
    const { lastname } = this.props;
    // ( if lastname is valid here)
    if (lastname) {
      this.setState({ lastnameValidator: 'true' });
    } else {
      this.setState({ lastnameValidator: 'false' });
    }
  }

  validateBirthdate = ():void => {
    const { birthDate } = this.props;
    // ( if birthDate is valid here)
    if (birthDate) {
      this.setState({ birthDateValidator: 'true' });
    } else {
      this.setState({ birthDateValidator: 'false' });
    }
  }

  validateAddress = ():void => {
    const { address } = this.props;
    // ( if address is valid here)
    if (address) {
      this.setState({ addressValidator: 'true' });
    } else {
      this.setState({ addressValidator: 'false' });
    }
  }

  validateCity = ():void => {
    const { city } = this.props;
    // ( if password is valid here)
    if (city) {
      this.setState({ cityValidator: 'true' });
    } else {
      this.setState({ cityValidator: 'false' });
    }
  }

  validateState = ():void => {
    const { state } = this.props;
    // ( if state is valid here)
    if (state) {
      this.setState({ stateValidator: 'true' });
    } else {
      this.setState({ stateValidator: 'false' });
    }
  }

  validateZipcode = ():void => {
    const { zipcode } = this.props;
    // ( if zipcode is valid here)
    if (zipcode) {
      this.setState({ zipcodeValidator: 'true' });
    } else {
      this.setState({ zipcodeValidator: 'false' });
    }
  }

  validatePhonenumber = ():void => {
    const { phonenumber } = this.props;
    // ( if phonenumber is valid here)
    if (phonenumber) {
      this.setState({ phonenumberValidator: 'true' });
    } else {
      this.setState({ phonenumberValidator: 'false' });
    }
  }

  validateEmail = ():void => {
    const { email } = this.props;
    // ( if email is valid here)
    if (email) {
      this.setState({ emailValidator: 'true' });
    } else {
      this.setState({ emailValidator: 'false' });
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

  handleStepComplete = (e) => {
    e.preventDefault();
    // check if all elements are valid
    if (this.state.firstnameValidator === 'true'
      && this.state.lastnameValidator === 'true'
      && this.state.birthDateValidator === 'true'
      && this.state.addressValidator === 'true'
      && this.state.cityValidator === 'true'
      && this.state.stateValidator === 'true'
      && this.state.zipcodeValidator === 'true'
      && this.state.phonenumberValidator === 'true'
      && this.state.emailValidator === 'true') {
      this.props.handleContinue();
    } else {
      this.props.alert.show('One or more fields are invalid');
    }
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
      onChangeBirthDate,
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
          <div className="col-md-8">
            <div className="text-center pb-4 mb-2">
              <h2><b>Next, tell us about yourself</b></h2>
            </div>
            <form>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label text-right">Name</label>
                <div className="col-sm-4">
                  <label htmlFor="firstname" className="sr-only sr-only-focusable">First Name</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(firstnameValidator)}`}
                    placeholder="First Name"
                    id="firstname"
                    value={firstname}
                    onChange={onChangeFirstname}
                    onBlur={this.validateFirstname}
                    required
                  />
                  {this.generalMessage(firstnameValidator)}
                </div>
                <div className="col-sm-4">
                  <label htmlFor="lastname" className="sr-only sr-only-focusable">Last Name</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(lastnameValidator)}`}
                    placeholder="Last Name"
                    id="lastname"
                    value={lastname}
                    onChange={onChangeLastname}
                    onBlur={this.validateLastname}
                    required
                  />
                  {this.generalMessage(lastnameValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="birthDate" className="col-sm-3 col-form-label text-right">Birth Date</label>
                <div className="col-sm-9">
                  <DatePicker
                    id="birthDate"
                    onChange={this.customOnChangeBirthDate}
                    onBlur={this.validateBirthdate}
                    selected={birthDate}
                    className={`form-control form-purple ${this.colorToggle(birthDateValidator)}`}
                    required
                  />
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label text-right">Mailing Address</label>
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
                    required
                  />
                  {this.generalMessage(addressValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="" className="col-sm-3 col-form-label invisible" />
                <div className="col-sm-3">
                  <label htmlFor="city" className="sr-only sr-only-focusable">City</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(cityValidator)}`}
                    id="city"
                    placeholder="City"
                    value={city}
                    onChange={onChangeCity}
                    onBlur={this.validateCity}
                    required
                  />
                  {this.generalMessage(cityValidator)}
                </div>
                <div className="col-sm-3">
                  <label htmlFor="state" className="sr-only sr-only-focusable">State</label>
                  <select
                    className={`form-control form-purple ${this.colorToggle(stateValidator)}`}
                    id="state"
                    value={state}
                    onChange={onChangeState}
                    onBlur={this.validateState}
                    required
                  >
                    {USStates.map((USState) => (<option key={USState.abbreviation}>{USState.abbreviation}</option>))}
                  </select>
                  {this.generalMessage(stateValidator)}
                </div>
                <div className="col-sm-3">
                  <label htmlFor="zipcode" className="sr-only sr-only-focusable">Zipcode</label>
                  <input
                    type="text"
                    className={`form-control form-purple ${this.colorToggle(zipcodeValidator)}`}
                    id="zipcode"
                    placeholder="Zipcode"
                    value={zipcode}
                    onChange={onChangeZipcode}
                    onBlur={this.validateZipcode}
                    required
                  />
                  {this.generalMessage(zipcodeValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="phonenumber" className="col-sm-3 col-form-label text-right">Phone number</label>
                <div className="col-sm-9">
                  <input
                    type="tel"
                    className={`form-control form-purple ${this.colorToggle(phonenumberValidator)}`}
                    id="phonenumber"
                    placeholder="Phone number"
                    value={phonenumber}
                    onChange={onChangePhoneNumber}
                    onBlur={this.validatePhonenumber}
                    required
                  />
                  {this.generalMessage(phonenumberValidator)}
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="email" className="col-sm-3 col-form-label text-right">Email address</label>
                <div className="col-sm-9">
                  <input
                    type="email"
                    className={`form-control form-purple ${this.colorToggle(emailValidator)}`}
                    id="email"
                    placeholder="Email address"
                    value={email}
                    onChange={onChangeEmail}
                    onBlur={this.validateEmail}
                    required
                  />
                  {this.generalMessage(emailValidator)}
                </div>
              </div>
            </form>
            <div className="d-flex">
              <button type="button" className="btn btn-outline-danger mt-5" onClick={this.handleStepPrevious}>Previous Step</button>

              <button type="button" className="ml-auto btn btn-primary mt-5" onClick={this.handleStepComplete}>Continue</button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(PersonalInformation);
