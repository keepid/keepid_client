import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import USStates from '../static/data/states_titlecase.json';
import { withAlert } from 'react-alert';
import getServerURL from '../serverOverride';
import DatePicker from 'react-datepicker';

enum PasswordError {
  OldPasswordWrong = 1,
  NewPasswordSameAsOld,
  NewPasswordInvalid,
  NewPasswordConfirmWrong,
  NoError,
}

enum Section {
  BasicInfo = "BasicInfo",
  AddressInfo = "AddressInfo",
  PasswordChange = "PasswordChange",
  None = "None",
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

  constructor(props: InputProps) {
    super(props);
    const {
      inputValue
    } = props;
    this.state = {
      readOnly: true,
      input: inputValue,
      originalInput: inputValue,
      wrongPasswordInModal: false,
      showPasswordConfirm: false,
      buttonState: '',
    }
    this.birthDateString = this.birthDateString.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSetReadOnly = this.handleSetReadOnly.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this); 
    this.handleOpenPasswordConfirmModal = this.handleOpenPasswordConfirmModal.bind(this);
    this.handleClosePasswordConfirm = this.handleClosePasswordConfirm.bind(this);
    this.handleSaveInfo = this.handleSaveInfo.bind(this);
  }

  birthDateString(birthDate: Date) {
    const personBirthMonth = birthDate.getMonth() + 1;
    const personBirthMonthString = (personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth);
    const personBirthDay = birthDate.getDate();
    const personBirthDayString = (personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay);
    const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
    return personBirthDateFormatted;
  }

  // edit input
  handleEdit() {
    this.setState({
      readOnly: false,
    })
  }

  // cancel the edit
  handleCancel(event) {
    this.setState({
      readOnly: true,
    });
    const name = event.target.name;
    const { 
      originalInput 
    } = this.state;
    this.setState({
      input: originalInput,
    });
  }

  handleSetReadOnly() {
    this.setState({
      readOnly: true,
    })
  }

  handleInputChange(event) {
    const {
      inputType
    } = this.props;
    // for date picker
    if (inputType === "date") {
      this.setState({
        input: event,
      });
      return;
    }
    const target = event.target;
    const value = target.value;
    const name = target.name;
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
    })
  }

  // trigerred after correctly entering password in confirm modal
  handleSaveInfo(password: string) {
    this.setState({
      buttonState: 'running' 
    });
    const {
      inputName,
      inputLabel,
      alert,
      inputType,
    } = this.props;

    // API call to update information
    let { 
      input 
    } = this.state;

    // format date
    if (inputType === "date") {
      input = this.birthDateString(input);
    }

    const data = {
      key: inputName,
      value: input,
      password: password,
    };

    console.log(data);

    fetch(`${getServerURL()}/change-account-setting`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json())
      .then((responseJSON) => {
        responseJSON = JSON.parse(responseJSON);
        const status = responseJSON.status;
        const message = responseJSON.message;
        if (status === 'SUCCESS') { // succesfully updated key and value
          alert.show(`Successfully updated ${inputLabel}`)
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
          { inputType ===  "select" ? 
            <select className="form-control form-purple"
              id={inputName}
              name={inputName}
              value={input}
              onChange={this.handleInputChange} 
              disabled={readOnly}>
              {USStates.map((USState, index) => (<option key={index}>{USState.abbreviation}</option>))}
            </select> : null
          }
          { inputType === "text" || inputType === "tel" ? 
            <input type={inputType} className="form-control form-purple" name={inputName} id={inputName} value={input} onChange={this.handleInputChange} readOnly={readOnly}/>
            : null
          }
          { inputType === "date" ?
            <DatePicker
              id={inputName}
              onChange={this.handleInputChange}
              selected={input}
              className="form-control form-purple"
              readOnly={readOnly}
            /> : null
          }
        </div>
        <div className="col-3">
          { readOnly ? <button type="button" name={inputName} className="btn btn-outline-dark float-right" onClick={this.handleEdit}>Edit</button>
            : <span className="float-right">
              <button type="reset" name={inputName} className="btn btn-light mr-3" onClick={this.handleCancel}>Cancel</button>
              <button type="submit" name={inputName} className="btn btn-outline-dark" onClick={this.handleOpenPasswordConfirmModal}>Save</button>
            </span>
          }
        </div>
        <ConfirmPasswordModal show={showPasswordConfirm} section={inputName} buttonState={buttonState} wrongPasswordInModal={wrongPasswordInModal} handleSaveInfo={this.handleSaveInfo} handleClosePasswordConfirm={this.handleClosePasswordConfirm}/>
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
    const target = event.target;
    const enteredPasswordInModal = target.value;
    const name = target.name;
    this.setState({
      enteredPasswordInModal: enteredPasswordInModal,
    });
  }

  // submitted through the password confirm modal
  async handlePasswordSubmit(event) {
    event.preventDefault();
    const {
      enteredPasswordInModal,
    } = this.state;

    const {
      section,
      handleSaveInfo
    } = this.props;
      
    // this function makes API call
    handleSaveInfo(enteredPasswordInModal);
  }

  // closing the modal
  handleClose() {
    this.setState({
      enteredPasswordInModal: ''
    });
    const {
      handleClosePasswordConfirm
    } = this.props;
    handleClosePasswordConfirm();
  }

  render() {
    const {
      show,
      section,
      buttonState,
      wrongPasswordInModal,
      handleClosePasswordConfirm,
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
            <input type="password" className={ wrongPasswordInModal ? "form-control form-red" : "form-control form-purple" } name="passwordConfirm" id="passwordConfirm" onChange={this.handlePasswordInput}/>
            <Modal.Footer>
              <Button type="reset" variant="light" onClick={this.handleClose}>Cancel</Button>
              <Button type="submit" className={`ld-ext-right ${buttonState}`} variant="outline-dark" onClick={this.handlePasswordSubmit}>Submit<div className="ld ld-ring ld-spin"/></Button> 
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
  oldPassword: string,
  enteredPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
  passwordError: PasswordError, 
  passwordChangeReadOnly: boolean,
}

class MyAccount extends Component<Props, State, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {
      // user info
      username: 'client',

      // basic info
      birthDate: new Date(),
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'Bob.Smith@gmail.com',
      phone: '123-456-7890',
      
      // address info
      address: "123 Avenue street",
      city: "Philadelphia",
      state: "PA",
      zipcode: "19104",
      
      // pasword variables
      oldPassword: 'password',
      enteredPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordError: PasswordError.NoError,
      passwordChangeReadOnly: true,
    };
    this.handleEditPassword = this.handleEditPassword.bind(this);
    this.handleCancelPassword = this.handleCancelPassword.bind(this)
    this.handleInputChangePassword = this.handleInputChangePassword.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
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
    });
  }


  handleInputChangePassword(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    const newState = { 
      [name]: value,
      passwordError: PasswordError.NoError,
    } as Pick<State, keyof State>;
    this.setState(newState);
  }

  // change password section
  handleChangePassword(event) {
    event.preventDefault();

    const { 
      oldPassword, 
      enteredPassword, 
      newPassword,
      newPasswordConfirm 
    } = this.state;

    // check the old password was entered correctly
    if (oldPassword === enteredPassword) { 
      // new password must be different from old password
      if (oldPassword !== newPassword) {
        // new password meets requirements - TODO figure out the actual requirements
        if (newPassword.length >= 8) {
          // new password must be entered correctly twice
          if (newPassword === newPasswordConfirm) {
            // TODO - call API to change password - also add popup confirming
            console.log("password reset API called");

            this.setState({
              passwordError: PasswordError.NoError,
              oldPassword: newPassword,
              passwordChangeReadOnly: true,
              enteredPassword: '',
              newPassword: '',
              newPasswordConfirm: '',
            });

          } else {
            this.setState({
              passwordError: PasswordError.NewPasswordConfirmWrong
            });
          }
        } else {
          // new password doesn't meet requirements
          this.setState({
            passwordError: PasswordError.NewPasswordInvalid
          });
        }
      } else {
        // new password same as old password
        this.setState({
          passwordError: PasswordError.NewPasswordSameAsOld
        });
      }
    } else {
      // old password entered wrong
      this.setState({
        passwordError: PasswordError.OldPasswordWrong
      });
    }
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
      oldPassword,
      enteredPassword,
      newPassword,
      newPasswordConfirm,
      passwordError,
    } = this.state;

    const { 
      alert 
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
            <br></br>
            <div className="row mb-3 mt-3">
              <div className="col-3 card-text mt-2 text-primary-theme">Username</div>
              <div className="col-9 card-text">
                <input type="text" className="form-control form-purple" name="username" id="username" value={username} readOnly={true}/>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Basic Information</h5>
            </div>
            <br></br>
            <form>
              <RenderInput inputLabel={"First Name"} inputName={"firstName"} inputValue={firstName} inputType="text" alert={alert} />
              <RenderInput inputLabel={"Last Name"} inputName={"lastName"} inputValue={lastName} inputType="text" alert={alert} />
              <RenderInput inputLabel={"Birth Date"} inputName={"birthDate"} inputValue={birthDate} inputType="date" alert={alert} />
              <RenderInput inputLabel={"Email"} inputName={"email"} inputValue={email} inputType="text" alert={alert} />
              <RenderInput inputLabel={"Phone Number"} inputName={"phone"} inputValue={phone} inputType="tel" alert={alert} />
            </form>
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Address Information</h5>
            </div>
            <br></br>
            <form>
              <RenderInput inputLabel={"Address"} inputName={"address"} inputValue={address} inputType="text" alert={alert} />
              <RenderInput inputLabel={"City"} inputName={"city"} inputValue={city} inputType="text" alert={alert} />
              <RenderInput inputLabel={"State"} inputName={"state"} inputValue={state} inputType="select" alert={alert} />
              <RenderInput inputLabel={"Zip Code"} inputName={"zipcode"} inputValue={zipcode} inputType="text" alert={alert} />
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
            <br></br>
            <form>
              { passwordError === PasswordError.OldPasswordWrong ? <p className="text-danger col-md-9 offset-md-3">Old password is incorrect</p> : null }
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">Old password</div>
                <div className="col-9 card-text">
                  <input type="password" className="form-control form-purple" name="enteredPassword" id="enteredPassword" value={enteredPassword} onChange={this.handleInputChangePassword} readOnly={passwordChangeReadOnly}/>
                </div>
              </div>
              { passwordError === PasswordError.NewPasswordSameAsOld ? <p className="text-danger col-md-9 offset-md-3">The new password cannot match the old password</p> : null }
              { passwordError === PasswordError.NewPasswordInvalid ? <p className="text-danger col-md-9 offset-md-3">The new password is invalid</p> : null }
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">New password</div>
                <div className="col-9 card-text">
                  <input type="password" className="form-control form-purple" name="newPassword" id="newPassword" value={newPassword} onChange={this.handleInputChangePassword} readOnly={passwordChangeReadOnly}/>
                </div>
              </div>
              { passwordError === PasswordError.NewPasswordConfirmWrong ? <p className="text-danger col-md-9 offset-md-3">The password does not match the one above</p> : null }
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">Confirm new password</div>
                <div className="col-9 card-text">
                  <input type="password" className="form-control form-purple" name="newPasswordConfirm" id="newPasswordConfirm" value={newPasswordConfirm} onChange={this.handleInputChangePassword} readOnly={passwordChangeReadOnly}/>
                </div>
              </div>
              <div>
              { passwordChangeReadOnly ? null 
                : <span className="float-right">
                  <button type="reset" name={Section.PasswordChange} className="btn btn-light mr-3" onClick={this.handleCancelPassword}>Cancel</button>
                  <button type="submit" className="btn btn-outline-dark" onClick={this.handleChangePassword}>Save</button>
                </span>
              }
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
              <div className="col-3 card-text mt-2 text-danger">
                Not Set Up Yet
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
