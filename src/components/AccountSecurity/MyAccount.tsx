import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Switch from 'react-switch';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import uuid from 'react-uuid';
import USStates from '../../static/data/states_titlecase.json';
import getServerURL from '../../serverOverride';

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
  None = 'None',
}

// input field in the form
interface InputProps {
  inputLabel: string,
  inputName: string,
  inputValue: string | Date,
  alert: any,
  inputType: string,
}

interface InputState {
  readOnly: boolean,
  input: any,
  originalInput: any,
  wrongPasswordInModal: boolean,
  showPasswordConfirm: boolean,
  buttonState: string,
}

// one field e.g. birthDate, address, etc.
class RenderInput extends Component<InputProps, InputState> {
  static birthDateString(birthDate: Date) {
    const personBirthMonth = birthDate.getMonth() + 1;
    const personBirthMonthString = (personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth);
    const personBirthDay = birthDate.getDate();
    const personBirthDayString = (personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay);
    const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
    return personBirthDateFormatted;
  }

  constructor(props: InputProps) {
    super(props);
    this.state = {
      readOnly: true,
      input: '',
      originalInput: '',
      wrongPasswordInModal: false,
      showPasswordConfirm: false,
      buttonState: '',
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSetReadOnly = this.handleSetReadOnly.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOpenPasswordConfirmModal = this.handleOpenPasswordConfirmModal.bind(this);
    this.handleClosePasswordConfirm = this.handleClosePasswordConfirm.bind(this);
    this.handleSaveInfo = this.handleSaveInfo.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      inputValue,
    } = this.props;
    if (inputValue !== prevProps.inputValue) {
      this.setState({
        input: inputValue,
        originalInput: inputValue,
      });
    }
  }

  // edit input
  handleEdit() {
    this.setState({
      readOnly: false,
    });
  }

  // cancel the edit
  handleCancel(event) {
    this.setState({
      readOnly: true,
    });
    const {
      originalInput,
    } = this.state;
    this.setState({
      input: originalInput,
    });
  }

  handleSetReadOnly() {
    this.setState({
      readOnly: true,
    });
  }

  handleInputChange(event) {
    const {
      inputType,
    } = this.props;
    // for date picker
    if (inputType === 'date') {
      this.setState({
        input: event,
      });
      return;
    }
    const { target } = event;
    const { value } = target;
    this.setState({
      input: value,
    });
  }

  // opens up the password confirm modal
  handleOpenPasswordConfirmModal(event) {
    event.preventDefault();
    this.setState({
      showPasswordConfirm: true,
    });
  }

  // close password confirm modal
  handleClosePasswordConfirm() {
    this.setState({
      wrongPasswordInModal: false,
      showPasswordConfirm: false,
      buttonState: '',
    });
  }

  // trigerred after correctly entering password in confirm modal
  handleSaveInfo(password: string) {
    this.setState({
      buttonState: 'running',
    });
    const {
      inputName,
      inputLabel,
      alert,
      inputType,
    } = this.props;

    // API call to update information
    let {
      input,
    } = this.state;

    // format date
    if (inputType === 'date') {
      input = RenderInput.birthDateString(input);
    }

    const data = {
      key: inputName,
      value: input,
      password,
    };

    fetch(`${getServerURL()}/change-account-setting`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const { status } = responseObject;
        const { message } = responseObject;
        if (status === 'SUCCESS') { // successfully updated key and value
          alert.show(`Successfully updated ${inputLabel}`);
          this.setState({
            originalInput: input,
            showPasswordConfirm: false,
            wrongPasswordInModal: false,
            readOnly: true,
          });
        } else if (status === 'AUTH_FAILURE') {
          // wrong password
          this.setState({
            wrongPasswordInModal: true,
          });
        } else {
          alert.show(`Failed to update ${inputLabel}: ${message}`);
          this.setState({
            showPasswordConfirm: false,
            wrongPasswordInModal: false,
          });
        }
        this.setState({ buttonState: '' });
      });
  }

  render() {
    const {
      inputLabel,
      inputName,
      inputType,
    } = this.props;

    const {
      readOnly,
      input,
      showPasswordConfirm,
      buttonState,
      wrongPasswordInModal,
    } = this.state;

    return (
      <div className="row mb-3 mt-3">
        <div className="col-3 card-text mt-2 text-primary-theme">{inputLabel}</div>
        <div className="col-6 card-text">
          { inputType === 'select'
            ? (
              <select
                className="form-control form-purple"
                id={inputName}
                name={inputName}
                value={input}
                onChange={this.handleInputChange}
                disabled={readOnly}
              >
                {USStates.map((USState) => (<option key={uuid()}>{USState.abbreviation}</option>))}
              </select>
            ) : null}
          { inputType === 'text' || inputType === 'tel'
            ? <input type={inputType} className="form-control form-purple" name={inputName} id={inputName} value={input} onChange={this.handleInputChange} readOnly={readOnly} />
            : null}
          { inputType === 'date' ? (
            <DatePicker
              id={inputName}
              onChange={this.handleInputChange}
              selected={input}
              className="form-control form-purple"
              readOnly={readOnly}
            />
          ) : null}
        </div>
        <div className="col-3">
          { readOnly ? <button type="button" name={inputName} className="btn btn-outline-dark float-right" onClick={this.handleEdit}>Edit</button>
            : (
              <span className="float-right">
                <button type="button" name={inputName} className="btn btn-light mr-3" onClick={this.handleCancel}>Cancel</button>
                <button type="submit" name={inputName} className="btn btn-outline-dark" onClick={this.handleOpenPasswordConfirmModal}>Save</button>
              </span>
            )}
        </div>
        <ConfirmPasswordModal show={showPasswordConfirm} section={inputName} buttonState={buttonState} wrongPasswordInModal={wrongPasswordInModal} handleSaveInfo={this.handleSaveInfo} handleClosePasswordConfirm={this.handleClosePasswordConfirm} />
      </div>
    );
  }
}

// modal for confirming password before updating information
interface ConfirmPasswordModalProps {
  show: boolean,
  section: string,
  wrongPasswordInModal: boolean,
  buttonState: string,
  handleSaveInfo(password: string): any,
  handleClosePasswordConfirm(): any,
}

interface ConfirmPasswordModalState {
  enteredPasswordInModal: string,
}

class ConfirmPasswordModal extends Component<ConfirmPasswordModalProps, ConfirmPasswordModalState> {
  constructor(props: ConfirmPasswordModalProps) {
    super(props);
    this.state = {
      enteredPasswordInModal: '',
    };
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
  }

  // entering password in modal
  handlePasswordInput(event) {
    const { target } = event;
    const enteredPasswordInModal = target.value;
    this.setState({
      enteredPasswordInModal,
    });
  }

  // submitted through the password confirm modal
  async handlePasswordSubmit(event) {
    event.preventDefault();
    const {
      enteredPasswordInModal,
    } = this.state;

    const {
      handleSaveInfo,
    } = this.props;

    // this function makes API call
    handleSaveInfo(enteredPasswordInModal);
  }

  // closing the modal
  handleClose() {
    this.setState({
      enteredPasswordInModal: '',
    });
    const {
      handleClosePasswordConfirm,
    } = this.props;
    handleClosePasswordConfirm();
  }

  render() {
    const {
      show,
      buttonState,
      wrongPasswordInModal,
    } = this.props;

    return (
      <Modal show={show} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Confirm Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <p>Please enter your password to make these changes.</p>
            { wrongPasswordInModal ? <p className="text-danger">Password is incorrect</p> : null }
            <input type="password" className={wrongPasswordInModal ? 'form-control form-red' : 'form-control form-purple'} name="passwordConfirm" id="passwordConfirm" onChange={this.handlePasswordInput} />
            <Modal.Footer>
              <Button type="button" variant="light" onClick={this.handleClose}>Cancel</Button>
              <Button type="submit" className={`ld-ext-right ${buttonState}`} variant="outline-dark" onClick={this.handlePasswordSubmit}>
                Submit
                <div className="ld ld-ring ld-spin" />
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
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
}

class MyAccount extends Component<Props, State, {}> {
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

      // pasword variables
      enteredPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordError: PasswordError.NoError,
      passwordChangeReadOnly: true,
      buttonState: '',
      // 2FA variable
      twoFactorOn: true,
    };

    this.handleEditPassword = this.handleEditPassword.bind(this);
    this.handleCancelPassword = this.handleCancelPassword.bind(this);
    this.handleInputChangePassword = this.handleInputChangePassword.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChange2FA = this.handleChange2FA.bind(this);
  }

  componentDidMount() {
    fetch(`${getServerURL()}/get-user-info`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((responseJSON) => {
        const responseObject = JSON.parse(responseJSON);
        const date = responseObject.birthDate.split('-');
        const newState = {
          username: responseObject.username,
          firstName: responseObject.firstName,
          lastName: responseObject.lastName,
          birthDate: new Date(date[2], date[0] - 1, date[1]),
          email: responseObject.email,
          phone: responseObject.phone,
          city: responseObject.city,
          state: responseObject.state,
          address: responseObject.address,
          zipcode: responseObject.zipcode,
          twoFactorOn: responseObject.twoFactorOn,
        };
        this.setState(newState);
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
        const { status } = JSON.parse(responseJSON);
        // old passwrod entered correctly
        if (status === 'AUTH_SUCCESS') {
          // new password is the same as the old password
          if (enteredPassword === newPassword) {
            this.setState({
              passwordError: PasswordError.NewPasswordSameAsOld,
            });
          } else { // no error - password changed succesfully
            this.handleCancelPassword();
            alert.show('Successfully updated password');
          }
        } else if (status === 'AUTH_FAILURE') { // wrong old password
          this.setState({
            passwordError: PasswordError.OldPasswordWrong,
          });
        }

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
        const { status } = JSON.parse(responseJSON);
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
                <input type="text" className="form-control form-purple" name="username" id="username" value={username} readOnly />
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
              <RenderInput inputLabel="First Name" inputName="firstName" inputValue={firstName} inputType="text" alert={alert} />
              <RenderInput inputLabel="Last Name" inputName="lastName" inputValue={lastName} inputType="text" alert={alert} />
              <RenderInput inputLabel="Birth Date" inputName="birthDate" inputValue={birthDate} inputType="date" alert={alert} />
              <RenderInput inputLabel="Email" inputName="email" inputValue={email} inputType="text" alert={alert} />
              <RenderInput inputLabel="Phone Number" inputName="phone" inputValue={phone} inputType="tel" alert={alert} />
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
              <RenderInput inputLabel="Address" inputName="address" inputValue={address} inputType="text" alert={alert} />
              <RenderInput inputLabel="City" inputName="city" inputValue={city} inputType="text" alert={alert} />
              <RenderInput inputLabel="State" inputName="state" inputValue={state} inputType="select" alert={alert} />
              <RenderInput inputLabel="Zip Code" inputName="zipcode" inputValue={zipcode} inputType="text" alert={alert} />
            </form>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Change Password</h5>
              { passwordChangeReadOnly ? <button type="button" name="editPassword" className="btn btn-outline-dark float-right" onClick={this.handleEditPassword}>Edit</button>
                : null }
            </div>
            <br />
            <form>
              { passwordError === PasswordError.OldPasswordWrong ? <p className="text-danger col-md-9 offset-md-3">Old password is incorrect</p> : null }
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">Old password</div>
                <div className="col-9 card-text">
                  <input type="password" className="form-control form-purple" name="enteredPassword" id="enteredPassword" value={enteredPassword} onChange={this.handleInputChangePassword} readOnly={passwordChangeReadOnly} />
                </div>
              </div>
              { passwordError === PasswordError.NewPasswordSameAsOld ? <p className="text-danger col-md-9 offset-md-3">The new password cannot match the old password</p> : null }
              { passwordError === PasswordError.NewPasswordInvalid ? <p className="text-danger col-md-9 offset-md-3">The new password is invalid</p> : null }
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">New password (at least 8 characters)</div>
                <div className="col-9 card-text">
                  <input type="password" className="form-control form-purple" name="newPassword" id="newPassword" value={newPassword} onChange={this.handleInputChangePassword} readOnly={passwordChangeReadOnly} />
                </div>
              </div>
              { passwordError === PasswordError.NewPasswordConfirmWrong ? <p className="text-danger col-md-9 offset-md-3">The password does not match the one above</p> : null }
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">Confirm new password</div>
                <div className="col-9 card-text">
                  <input type="password" className="form-control form-purple" name="newPasswordConfirm" id="newPasswordConfirm" value={newPasswordConfirm} onChange={this.handleInputChangePassword} readOnly={passwordChangeReadOnly} />
                </div>
              </div>
              <div>
                { passwordChangeReadOnly ? null
                  : (
                    <span className="float-right">
                      <Button type="button" name={Section.PasswordChange} className="mr-3" variant="light" onClick={this.handleCancelPassword}>Cancel</Button>
                      <Button type="submit" className={`ld-ext-right ${buttonState}`} variant="outline-dark" onClick={this.handleChangePassword}>
                        Submit
                        <div className="ld ld-ring ld-spin" />
                      </Button>
                    </span>
                  )}
              </div>
            </form>
          </div>
        </div>

        <div className="card mt-3 mb-3">
          <div className="card-body">
            <h5 className="card-title pb-3">Two Factor Authentication</h5>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Status:
              </div>
              <div className="input-group mb-3 col-6">
                <label>
                  <Switch onChange={this.handleChange2FA} checked={this.state.twoFactorOn} />
                </label>
              </div>
            </div>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Phone Number:
              </div>
              <div className="col-6 card-text">
                <input type="text" className="form-control form-purple" id="phoneNumber2" placeholder="(123)-456-7890" />
              </div>
              <button type="button" className="btn btn-outline-success">Submit</button>
            </div>
          </div>
        </div>
        <div className="card mt-3 mb-3">
          <div className="card-body">
            <h5 className="card-title pb-3">Login History</h5>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2">
                Access Details:
              </div>
              <div className="col-9 card-text mt-2 text-success">
                Some Date and Time here, Some Address here (make this a list)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withAlert()(MyAccount);
