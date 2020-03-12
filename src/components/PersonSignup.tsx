import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { withAlert } from 'react-alert';
import Role from '../static/Role';
import USStates from '../static/data/states_titlecase.json';
import getServerURL from '../serverOverride';

interface Props {
  personRole: Role,
  alert: any
}

interface State {
  permissionOK: boolean,
  submitSuccessful: boolean,
  personFirstName: string,
  personLastName: string,
  personBirthDate: Date,
  personEmail: string,
  personPhoneNumber: string,
  personAddressStreet: string,
  personAddressCity: string,
  personAddressState: string,
  personAddressZipcode: string,
  personUsername: string,
  personPassword: string,
  personConfirmPassword: string,
  buttonState: string
}

class PersonSignup extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);

    this.state = {
      permissionOK: true,
      submitSuccessful: false,
      personFirstName: '',
      personLastName: '',
      personBirthDate: new Date(),
      personEmail: '',
      personPhoneNumber: '',
      personAddressStreet: '',
      personAddressCity: '',
      personAddressState: USStates[0].abbreviation,
      personAddressZipcode: '',
      personUsername: '',
      personPassword: '',
      personConfirmPassword: '',
      buttonState: '',
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChangePersonFirstName = this.handleChangePersonFirstName.bind(this);
    this.handleChangePersonLastName = this.handleChangePersonLastName.bind(this);
    this.handleChangePersonBirthDate = this.handleChangePersonBirthDate.bind(this);
    this.handleChangePersonEmail = this.handleChangePersonEmail.bind(this);
    this.handleChangePersonPhoneNumber = this.handleChangePersonPhoneNumber.bind(this);
    this.handleChangePersonAddressStreet = this.handleChangePersonAddressStreet.bind(this);
    this.handleChangePersonAddressCity = this.handleChangePersonAddressCity.bind(this);
    this.handleChangePersonAddressState = this.handleChangePersonAddressState.bind(this);
    this.handleChangePersonAddressZipcode = this.handleChangePersonAddressZipcode.bind(this);
    this.handleChangePersonUsername = this.handleChangePersonUsername.bind(this);
    this.updatePersonUsername = this.updatePersonUsername.bind(this);
    this.handleChangePersonPassword = this.handleChangePersonPassword.bind(this);
    this.handleChangePersonConfirmPassword = this.handleChangePersonConfirmPassword.bind(this);
  }

  handleSubmit(event: any) {
    event.preventDefault();
    this.setState({ buttonState: 'running' });
    const {
      personRole,
    } = this.props;
    const {
      personFirstName,
      personLastName,
      personEmail,
      personPhoneNumber,
      personAddressStreet,
      personAddressCity,
      personAddressState,
      personAddressZipcode,
      personUsername,
      personPassword,
      personConfirmPassword,
    } = this.state;
    if (personPassword !== personConfirmPassword) {
      this.props.alert.show('Your passwords are not identical');
      this.setState({ buttonState: '' });
    } else {
      const personRoleString = () => {
        switch (personRole) {
          case Role.Admin: return 'admin';
          case Role.Client: return 'client';
          case Role.HeadAdmin: return 'headadmin';
          case Role.LoggedOut: return 'loggedout';
          case Role.Volunteer: return 'volunteer';
          case Role.Worker: return 'worker';
          default: return '';
        }
      };
      fetch(`${getServerURL()}/create-user`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          firstname: personFirstName,
          lastname: personLastName,
          username: personUsername,
          email: personEmail,
          phonenumber: personPhoneNumber,
          address: personAddressStreet,
          city: personAddressCity,
          state: personAddressState,
          zipcode: personAddressZipcode,
          password: personPassword,
          personRole: personRoleString(),
        }),
      }).then((response) => response.json())
        .then((responseJSON) => {
          const userMessage = responseJSON;
          if(userMessage === "ENROLL_SUCCESS") {
            this.props.alert.show("Successfully Enrolled Person");
          } else if (userMessage === "USERNAME_ALREADY_EXISTS") {
            this.props.alert.show("Username Already Exists!");
          } else if (userMessage === "HASH_FAILURE") {
            this.props.alert.show("Server Failure: Please Try Again");
          } else {
            this.props.alert.show("Permissions Error");
          }
          
          this.setState({ submitSuccessful: true });
          this.setState({ buttonState: '' });
        }).catch((error) => {
          this.props.alert.show('Network Failure: Check Server Connection');
          this.setState({ buttonState: '' });
        });
    }
  }

  handleChangePersonFirstName(event: any) {
    this.setState({ personFirstName: event.target.value }, this.updatePersonUsername);
  }

  handleChangePersonLastName(event: any) {
    this.setState({ personLastName: event.target.value }, this.updatePersonUsername);
  }

  handleChangePersonBirthDate(date: any) {
    this.setState({ personBirthDate: date }, this.updatePersonUsername);
  }

  handleChangePersonEmail(event: any) {
    this.setState({ personEmail: event.target.value });
  }

  handleChangePersonPhoneNumber(event: any) {
    this.setState({ personPhoneNumber: event.target.value });
  }

  handleChangePersonAddressStreet(event: any) {
    this.setState({ personAddressStreet: event.target.value });
  }

  handleChangePersonAddressCity(event: any) {
    this.setState({ personAddressCity: event.target.value });
  }

  handleChangePersonAddressState(event: any) {
    this.setState({ personAddressState: event.target.value });
  }

  handleChangePersonAddressZipcode(event: any) {
    this.setState({ personAddressZipcode: event.target.value });
  }

  updatePersonUsername() {
    const {
      personFirstName,
      personLastName,
      personBirthDate,
    } = this.state;
    const personFirstNameNew = personFirstName.replace(/ /g, '-');
    const personLastNameNew = personLastName.replace(/ /g, '-');
    if (personBirthDate) {
      const personBirthMonth = personBirthDate.getMonth() + 1;
      const personBirthMonthString = (personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth);
      const personBirthDay = personBirthDate.getDate();
      const personBirthDayString = (personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay);
      const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${personBirthDate.getFullYear()}`;
      const personUsername = `${personFirstNameNew.toUpperCase()}-${personLastNameNew.toUpperCase()}`;
      this.setState({ personUsername });
    }
  }

  handleChangePersonUsername(event: any) {
    this.setState({ personUsername: event.target.value });
  }

  handleChangePersonPassword(event: any) {
    this.setState({ personPassword: event.target.value });
  }

  handleChangePersonConfirmPassword(event: any) {
    this.setState({ personConfirmPassword: event.target.value });
  }

  render() {
    const {
      personRole,
    } = this.props;

    const {
      permissionOK,
      submitSuccessful,
      personFirstName,
      personLastName,
      personEmail,
      personPhoneNumber,
      personAddressStreet,
      personAddressCity,
      personAddressState,
      personAddressZipcode,
      personUsername,
      personPassword,
      personConfirmPassword,
    } = this.state;

    if (submitSuccessful || !permissionOK) {
      return (
        <Redirect to="/" />
      );
    }

    const personFormHeader = () => {
      switch (personRole) {
        case Role.Admin:
          return 'Admin';
        case Role.Worker:
          return 'Worker';
        case Role.Volunteer:
          return 'Volunteer';
        case Role.Client:
          return 'Client';
        default: // Not Possible
          return '';
      }
    };

    return (
      <div className="container">
        <Helmet>
          <title>Sign Up</title>
          <meta name="description" content="Keep.id" />
        </Helmet>
        <div className="row">
          <div className="col-md-12">
            <div className="jumbotron jumbotron-fluid bg-white pb-2 mb-2">
              <div className="container">
                <h1 className="display-5 text-center font-weight-bold mb-3">
                  {personFormHeader()}
                  {' '}
                  Signup Page
                </h1>
                <p className="lead">Please fill out the following form to proceed with setting up the Keep.id account.</p>
              </div>
            </div>
            <form onSubmit={this.handleSubmit}>
              <div className="col-md-12">
                <div className="form-row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="inputFirstName" className="w-100 pr-3">
                      First Name
                      <text className="red-star">*</text>
                      <input
                        type="text"
                        className="form-control form-purple"
                        id="inputFirstName"
                        onChange={this.handleChangePersonFirstName}
                        value={personFirstName}
                        placeholder="John"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="inputLastName" className="w-100 pr-3">
                      Last Name
                      <text className="red-star">*</text>
                      <input
                        type="text"
                        className="form-control form-purple"
                        id="inputLastName"
                        onChange={this.handleChangePersonLastName}
                        value={personLastName}
                        placeholder="Doe"
                        required
                      />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-5 form-group">
                    <label htmlFor="inputPhoneNumber" className="w-100 pr-3">
                      Contact Phone Number
                      <text className="red-star">*</text>
                      <input
                        type="tel"
                        className="form-control form-purple"
                        id="inputPhoneNumber"
                        onChange={this.handleChangePersonPhoneNumber}
                        value={personPhoneNumber}
                        placeholder="1-(234)-567-8901"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-7 form-group">
                    <label htmlFor="inputEmail" className="w-100 pr-3">
                      Contact Email Address
                      <text className="red-star">*</text>
                      <input
                        type="email"
                        className="form-control form-purple"
                        id="inputEmail"
                        onChange={this.handleChangePersonEmail}
                        value={personEmail}
                        placeholder="contact@example.com"
                        required
                      />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputMailingAddress" className="w-100 pr-3">
                      Person Mailing Address
                      <text className="red-star">*</text>
                      <input
                        type="text"
                        className="form-control form-purple"
                        id="inputMailingAddress"
                        onChange={this.handleChangePersonAddressStreet}
                        value={personAddressStreet}
                        placeholder="311 Broad St"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputCity" className="w-100 pr-3">
                      City
                      <text className="red-star">*</text>
                      <input
                        type="text"
                        className="form-control form-purple"
                        id="inputCity"
                        onChange={this.handleChangePersonAddressCity}
                        value={personAddressCity}
                        placeholder="Philadelphia"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-2 form-group">
                    <label htmlFor="inputState" className="w-100 pr-3">
                      State
                      <text className="red-star">*</text>
                      <select
                        className="form-control form-purple"
                        id="inputState"
                        value={personAddressState}
                        onChange={this.handleChangePersonAddressState}
                        required
                      >
                        {USStates.map((USState) => (<option>{USState.abbreviation}</option>))}
                      </select>
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputZipCode" className="w-100 pr-3">
                      Zip Code
                      <text className="red-star">*</text>
                      <input
                        type="text"
                        className="form-control form-purple"
                        id="inputZipCode"
                        onChange={this.handleChangePersonAddressZipcode}
                        value={personAddressZipcode}
                        placeholder="19104"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputBirthDate" className="w-100 pr-3">
                      Birth Date
                      <text className="red-star">*</text>
                      <DatePicker id="inputBirthDate" onChange={this.handleChangePersonBirthDate} selected={this.state.personBirthDate} className="form-control form-purple" />
                    </label>
                  </div>
                  <div className="col-md-3 form-group">
                    <label htmlFor="inputUsername" className="w-100 pr-3">
                      Username (auto-generated)
                      <text className="red-star">*</text>
                      <input
                        type="text"
                        className="form-control form-purple"
                        id="inputUsername"
                        onChange={this.handleChangePersonUsername}
                        value={personUsername}
                        placeholder="John-Doe-02-21-20"
                        required
                      />
                    </label>
                  </div>
                </div>
                <div className="form-row">
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputPassword" className="w-100 pr-3">
                      Password
                      <text className="red-star">*</text>
                      <input
                        type="password"
                        className="form-control form-purple"
                        id="inputPassword"
                        onChange={this.handleChangePersonPassword}
                        value={personPassword}
                        placeholder="Password"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-md-4 form-group">
                    <label htmlFor="inputConfirmPassword" className="w-100 pr-3">
                      Confirm Password
                      <text className="red-star">*</text>
                      <input
                        type="password"
                        className="form-control form-purple"
                        id="inputConfirmPassword"
                        onChange={this.handleChangePersonConfirmPassword}
                        value={personConfirmPassword}
                        placeholder="Confirm password"
                        required
                      />
                    </label>
                  </div>
                  <div className="col-auto mt-3 pl-4 pt-2">
                    <button type="submit" className={`btn btn-success ld-ext-right ${this.state.buttonState}`}>
                      Submit
                      <div className="ld ld-ring ld-spin" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(PersonSignup);
