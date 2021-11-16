import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component, useEffect, useState } from 'react';
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
},
{
  dataField: 'location',
  text: 'Location',
  sort: true,
}];

export const MyAccount = (props: Props) => {
  const [username, setUsername] = useState<State['username']>('');
  const [birthDate, setBirthDate] = useState<State['birthDate']>(new Date());
  const [firstName, setFirstName] = useState<State['firstName']>('');
  const [lastName, setLastName] = useState<State['lastName']>('');
  const [email, setEmail] = useState<State['email']>('');
  const [phone, setPhone] = useState<State['phone']>('');
  const [address, setAddress] = useState<State['address']>('');
  const [city, setCity] = useState<State['city']>('');
  const [state, setState] = useState<State['state']>('');
  const [zipcode, setZipcode] = useState<State['zipcode']>('');
  const [enteredPassword, setEnteredPassword] = useState<State['enteredPassword']>('');
  const [newPassword, setNewPassword] = useState<State['newPassword']>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<State['newPasswordConfirm']>('');
  const [passwordError, setPasswordError] = useState<State['passwordError']>(PasswordError.NoError);
  const [passwordChangeReadOnly, setPasswordChangeReadOnly] = useState<State['passwordChangeReadOnly']>(true);
  const [buttonState, setButtonState] = useState<State['buttonState']>('');
  const [twoFactorOn, setTwoFactorOn] = useState<State['twoFactorOn']>(true);
  const [loginHistory, setLoginHistory] = useState<State['loginHistory']>([]);

  useEffect(() => {
    fetch(`${getServerURL()}/get-user-info`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((responseJSON) => {
        const date = responseJSON.birthDate.split('-');
        setUsername(responseJSON.username);
        setFirstName(responseJSON.firstName);
        setLastName(responseJSON.lastName);
        setBirthDate(new Date(date[2], date[0] - 1, date[1]));
        setEmail(responseJSON.email);
        setPhone(responseJSON.phone);
        setCity(responseJSON.city);
        setState(responseJSON.state);
        setAddress(responseJSON.address);
        setZipcode(responseJSON.zipcode);
        setTwoFactorOn(responseJSON.twoFactorOn);
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
          for (let i = 0; i < responseObject.history.length; i += 1) {
            const row = responseObject.history[i];
            row.id = i;
            loginHistory.push(row);
          }
          setLoginHistory(loginHistory);
        }
      });
  }, []);

  const handleEditPassword = () => {
    setPasswordChangeReadOnly(false);
  };

  const handleCancelPassword = () => {
    setPasswordChangeReadOnly(true);
    setEnteredPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setPasswordError(PasswordError.NoError);
    setButtonState('');
  };

  const handleInputChangePassword = (event) => {
    const { target } = event;
    const { value } = target;
    const { name } = target;
    switch (name) {
      case 'enteredPassword':
        setEnteredPassword(value);
        setPasswordError(PasswordError.NoError);
        break;
      case 'newPassword':
        setNewPassword(value);
        setPasswordError(PasswordError.NoError);
        break;
      case 'newPasswordConfirm':
        setNewPasswordConfirm(value);
        setPasswordError(PasswordError.NoError);
        break;
      default:
        console.log('No matches found');
    }
  };

  // change password section
  const handleChangePassword = (event) => {
    event.preventDefault();
    setButtonState('running');
    const { alert } = props;

    // confirm new passwor doesn't match
    if (newPassword !== newPasswordConfirm) {
      setButtonState('');
      setPasswordError(PasswordError.NewPasswordConfirmWrong);
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
          // new password is the same as the old password
          if (enteredPassword === newPassword) {
            setPasswordError(PasswordError.NewPasswordSameAsOld);
          } else { // no error - password changed succesfully
            handleCancelPassword();
            alert.show('Successfully updated password');
          }
        } else if (status === 'AUTH_FAILURE') { // wrong old password
          setPasswordError(PasswordError.OldPasswordWrong);
        } else if (status === 'INVALID_PARAMETER') {
          setPasswordError(PasswordError.NewPasswordInvalid);
        } else {
          alert.show('Failed resetting password, please try again.', { type: 'error' });
        }
        setButtonState('');
      })
      .catch(() => {
        alert.show('Failed resetting password, please try again.', { type: 'error' });
        setButtonState('');
      });
  };

  const handleChange2FA = (twoFactorOn) => {
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
          setTwoFactorOn(twoFactorOn);
        }
      });
  };

  const { alert } = props;

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
                  onClick={handleEditPassword}
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
                  onChange={handleInputChangePassword}
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
                  onChange={handleInputChangePassword}
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
                  onChange={handleInputChangePassword}
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
                      onClick={handleCancelPassword}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className={`ld-ext-right ${buttonState}`}
                      variant="outline-dark"
                      onClick={handleChangePassword}
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
              <Switch onChange={handleChange2FA} checked={twoFactorOn} />
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
            <h5 className="card-title float-left">Login History</h5>
          </div>
          <br />
          <div className="row m-3">
            <Table data={loginHistory} columns={loginHistoryCols} emptyInfo={{ description: 'No login history found' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAlert()(MyAccount);
