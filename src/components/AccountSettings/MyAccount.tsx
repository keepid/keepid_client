import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import Button from 'react-bootstrap/Button';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Helmet } from 'react-helmet';
import Switch from 'react-switch';

import getServerURL from '../../serverOverride';
import Table from '../BaseComponents/Table';
import RenderInput from './RenderInput';

enum PasswordError {
  OldPasswordWrong = 1,
  NewPasswordSameAsOld,
  NewPasswordInvalid,
  NewPasswordConfirmWrong,
  NoError,
}

enum Section {
  BasicInfo = 'BasicInfo',
  AddressInfo = 'AddressInfo',
  PasswordChange = 'PasswordChange',
}

interface Props {
  alert: any,
}

interface State {
  // user info
  username: string,
  // basic info
  birthDate: Date,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,

  // address info
  address: string,
  city: string,
  state: string,
  zipcode: string,

  // password variables
  enteredPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
  passwordError: PasswordError,
  passwordChangeReadOnly: boolean,
  buttonState: string,

  // 2FA variable
  twoFactorOn: boolean,

  // login history
  loginHistory: any[]
}

const loginHistoryCols = [{
  dataField: 'date',
  text: 'Date',
  sort: true,
}, {
  dataField: 'IP',
  text: 'IP',
  sort: true,
},
{
  dataField: 'device',
  text: 'Device',
  sort: true,
}];

export class MyAccount extends Component<Props, State, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {
      // user info
      username: '',

      // basic info
      birthDate: new Date(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',

      // address info
      address: '',
      city: '',
      state: '',
      zipcode: '',

      // password variables
      enteredPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordError: PasswordError.NoError,
      passwordChangeReadOnly: true,
      buttonState: '',
      // 2FA variable
      twoFactorOn: true,

      // login history
      loginHistory: [],
    };

    this.handleEditPassword = this.handleEditPassword.bind(this);
    this.handleCancelPassword = this.handleCancelPassword.bind(this);
    this.handleInputChangePassword = this.handleInputChangePassword.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChange2FA = this.handleChange2FA.bind(this);
  }

  componentDidMount() {
    fetch(`${getServerURL()}/get-user-info`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((responseJSON) => {
        const date = responseJSON.birthDate.split('-');
        const newState = {
          username: responseJSON.username,
          firstName: responseJSON.firstName,
          lastName: responseJSON.lastName,
          birthDate: new Date(date[2], date[0] - 1, date[1]),
          email: responseJSON.email,
          phone: responseJSON.phone,
          city: responseJSON.city,
          state: responseJSON.state,
          address: responseJSON.address,
          zipcode: responseJSON.zipcode,
          twoFactorOn: responseJSON.twoFactorOn,
        };
        this.setState(newState);
      });

    fetch(`${getServerURL()}/get-login-history`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = responseJSON;
        const { status } = responseObject;
        if (status === 'SUCCESS') {
          const loginHistory: any[] = [];
          for (let i = responseObject.history.length - 1; i >= 0; i -= 1) {
            const row = responseObject.history[i];
            row.id = i;
            loginHistory.push(row);
          }
          this.setState({
            loginHistory,
          });
        }
      });
  }

  handleEditPassword() {
    this.setState({
      passwordChangeReadOnly: false,
    });
  }

  handleCancelPassword() {
    this.setState({
      passwordChangeReadOnly: true,
      enteredPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordError: PasswordError.NoError,
      buttonState: '',
    });
  }

  handleInputChangePassword(event) {
    const { target } = event;
    const { value } = target;
    const { name } = target;
    const newState = {
      [name]: value,
      passwordError: PasswordError.NoError,
    } as Pick<State, keyof State>;
    this.setState(newState);
  }

  // change password section
  handleChangePassword(event) {
    event.preventDefault();
    this.setState({
      buttonState: 'running',
    });

    const {
      enteredPassword,
      newPassword,
      newPasswordConfirm,
    } = this.state;

    const {
      alert,
    } = this.props;

    // confirm new passwor doesn't match
    if (newPassword !== newPasswordConfirm) {
      this.setState({
        buttonState: '',
        passwordError: PasswordError.NewPasswordConfirmWrong,
      });
      return;
    }

    // call API route to change password
    const data = {
      oldPassword: enteredPassword,
      newPassword,
    };
    fetch(`${getServerURL()}/change-password`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        // old passwrod entered correctly
        if (status === 'AUTH_SUCCESS') {
          this.handleCancelPassword();
          alert.show('Successfully updated password');
        } else if (status === 'PASSWORD_UNCHANGED') {
          this.setState({
            passwordError: PasswordError.NewPasswordSameAsOld,
          });
        } else if (status === 'AUTH_FAILURE') { // wrong old password
          this.setState({
            passwordError: PasswordError.OldPasswordWrong,
          });
        } else if (status === 'INVALID_PARAMETER') {
          this.setState({
            passwordError: PasswordError.NewPasswordInvalid,
          });
        } else {
          alert.show('Failed resetting password, please try again.', { type: 'error' });
        }

        this.setState({
          buttonState: '',
        });
      })
      .catch(() => {
        alert.show('Failed resetting password, please try again.', { type: 'error' });
        this.setState({
          buttonState: '',
        });
      });
  }

  handleChange2FA(twoFactorOn) {
    const data = {
      twoFactorOn,
    };

    fetch(`${getServerURL()}/change-two-factor-setting`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'SUCCESS') { // succesfully updated key and value
          // alert.show(`Successfully set 2FA Value`);
          this.setState({ twoFactorOn });
        }
      });
  }

  render() {
    const {
      username,
      birthDate,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipcode,
      passwordChangeReadOnly,
      enteredPassword,
      newPassword,
      newPasswordConfirm,
      passwordError,
      buttonState,
      loginHistory,
      twoFactorOn,
    } = this.state;

    const {
      alert,
    } = this.props;

    return (
      <div className="container">
        <Helmet>
          <title>My Account</title>
          <meta name="description" content="Keep.id" />
        </Helmet>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">My Account</h5>
              <small className="float-right text-muted">This field cannot be changed.</small>
            </div>
            <br />
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2 text-primary-theme">Username</div>
              <div className="col-9 card-text">
                <input
                  type="text"
                  className="form-control form-purple"
                  name="username"
                  id="username"
                  value={username}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Basic Information</h5>
            </div>
            <br />
            <form>
              <RenderInput
                inputLabel="First Name"
                inputName="firstName"
                inputValue={firstName}
                inputType="text"
                alert={alert}
              />
              <RenderInput
                inputLabel="Last Name"
                inputName="lastName"
                inputValue={lastName}
                inputType="text"
                alert={alert}
              />
              <RenderInput
                inputLabel="Birth Date"
                inputName="birthDate"
                inputValue={birthDate}
                inputType="date"
                alert={alert}
              />
              <RenderInput inputLabel="Email" inputName="email" inputValue={email} inputType="text" alert={alert} />
              <RenderInput
                inputLabel="Phone Number"
                inputName="phone"
                inputValue={phone}
                inputType="tel"
                alert={alert}
              />
            </form>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Address Information</h5>
            </div>
            <br />
            <form>
              <RenderInput
                inputLabel="Address"
                inputName="address"
                inputValue={address}
                inputType="text"
                alert={alert}
              />
              <RenderInput inputLabel="City" inputName="city" inputValue={city} inputType="text" alert={alert} />
              <RenderInput inputLabel="State" inputName="state" inputValue={state} inputType="select" alert={alert} />
              <RenderInput
                inputLabel="Zip Code"
                inputName="zipcode"
                inputValue={zipcode}
                inputType="text"
                alert={alert}
              />
            </form>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Change Password</h5>
              {passwordChangeReadOnly
                ? (
                  <button
                    type="button"
                    name="editPassword"
                    className="btn btn-outline-dark float-right"
                    onClick={this.handleEditPassword}
                    data-testid="edit-change-password"
                  >
                    Edit
                  </button>
                )
                : null}
            </div>
            <br />
            <form>
              {passwordError === PasswordError.OldPasswordWrong
                ? <p className="text-danger col-md-9 offset-md-3">Old password is incorrect</p> : null}
              <div className="row mb-3 mt-3">
                <label htmlFor="enteredPassword" className="col-3 card-text mt-2 text-primary-theme">Old password</label>
                <div className="col-9 card-text">
                  <input
                    type="password"
                    className="form-control form-purple"
                    name="enteredPassword"
                    id="enteredPassword"
                    value={enteredPassword}
                    onChange={this.handleInputChangePassword}
                    readOnly={passwordChangeReadOnly}
                  />
                </div>
              </div>
              {passwordError === PasswordError.NewPasswordSameAsOld
                ? (
                  <p className="text-danger col-md-9 offset-md-3">
                    The new password cannot match the old
                    password
                  </p>
                ) : null}
              {passwordError === PasswordError.NewPasswordInvalid
                ? <p className="text-danger col-md-9 offset-md-3">The new password is invalid</p> : null}
              <div className="row mb-3 mt-3">
                <label htmlFor="newPassword" className="col-3 card-text mt-2 text-primary-theme">New password (at least 8 characters)</label>
                <div className="col-9 card-text">
                  <input
                    type="password"
                    className="form-control form-purple"
                    name="newPassword"
                    id="newPassword"
                    value={newPassword}
                    onChange={this.handleInputChangePassword}
                    readOnly={passwordChangeReadOnly}
                  />
                </div>
              </div>
              {passwordError === PasswordError.NewPasswordConfirmWrong
                ? <p className="text-danger col-md-9 offset-md-3">The password does not match the one above</p> : null}
              <div className="row mb-3 mt-3">
                <label htmlFor="newPasswordConfirm" className="col-3 card-text mt-2 text-primary-theme">Confirm new password</label>
                <div className="col-9 card-text">
                  <input
                    type="password"
                    className="form-control form-purple"
                    name="newPasswordConfirm"
                    id="newPasswordConfirm"
                    value={newPasswordConfirm}
                    onChange={this.handleInputChangePassword}
                    readOnly={passwordChangeReadOnly}
                  />
                </div>
              </div>
              <div>
                {passwordChangeReadOnly ? null
                  : (
                    <span className="float-right">
                      <Button
                        type="button"
                        name={Section.PasswordChange}
                        className="mr-3"
                        variant="light"
                        onClick={this.handleCancelPassword}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className={`ld-ext-right ${buttonState}`}
                        variant="outline-dark"
                        onClick={this.handleChangePassword}
                        data-testid="submit-change-password"
                      >
                        Submit
                        <div className="ld ld-ring ld-spin" />
                      </Button>
                    </span>
                  )}
              </div>
            </form>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Two-Factor Authentication</h5>
            </div>
            <br />
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2 text-primary-theme">Status</div>
              <div className="col-9 card-text">
                <Switch onChange={this.handleChange2FA} checked={twoFactorOn} />
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2 text-primary-theme">Phone Number</div>
              <div className="col-9 card-text">
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control form-purple"
                    id="phoneNumber2"
                    placeholder="(123)-456-7890"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary btn-primary-theme rounded-right" type="button">Submit</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-3 mb-3">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title text-center">Login History</h5>
            </div>
            <br />
            <div className="row m-3">
              <Table data={loginHistory} columns={loginHistoryCols} emptyInfo={{ description: 'No login history found' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(MyAccount);
