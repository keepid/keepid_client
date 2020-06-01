import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import USStates from '../static/data/states_titlecase.json';
import { withAlert } from 'react-alert';

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
  inputValue: string,
  readOnly: boolean,
  passwordType?: boolean,
  handleInputChange?(event: React.ChangeEvent<HTMLInputElement>): any,
}

function RenderInput(props: InputProps): React.ReactElement {
  const { 
    inputLabel,
    inputName,
    inputValue,
    readOnly,
    passwordType,
    handleInputChange,
  } = props;
  return (
    <div className="row mb-3 mt-3">
      <div className="col-3 card-text mt-2 text-primary-theme">{inputLabel}</div>
      <div className="col-9 card-text">
        <input type={ passwordType ? "password" : "text" } className="form-control form-purple" name={inputName} id={inputName} value={inputValue} onChange={handleInputChange} readOnly={readOnly}/>
      </div>
    </div>
  );
}


// modal for confirming password before updating information
interface ConfirmPasswordModalProps {
  show: boolean,
  section: Section,
  oldPassword: string,
  handleClosePasswordConfirm(): any,
  handleSaveInfo(section: Section): any,
}

interface ConfirmPasswordModalState {
  wrongPasswordInModal: boolean,
  enteredPasswordInModal: string,
}

class ConfirmPasswordModal extends Component<ConfirmPasswordModalProps, ConfirmPasswordModalState> {

  constructor(props: ConfirmPasswordModalProps) {
    super(props);
    this.state = {
      enteredPasswordInModal: '',
      wrongPasswordInModal: false,
    };
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  // entering password in modal
  handlePasswordInput(event) {
    const target = event.target;
    const enteredPasswordInModal = target.value;
    const name = target.name;

    if (name === "passwordConfirm") {
      this.setState({
        enteredPasswordInModal: enteredPasswordInModal,
        wrongPasswordInModal: false,
      });
    }
  }

  // submitted through the password confirm modal
  handlePasswordSubmit(event) {
    event.preventDefault();
    const {
      enteredPasswordInModal,
    } = this.state;

    const {
      section,
      oldPassword,
      handleSaveInfo
    } = this.props;
    
    // they entered the correct password
    if (enteredPasswordInModal === oldPassword) {
      
      // this function makes API call
      handleSaveInfo(section);

      this.setState({
        wrongPasswordInModal: false,
        enteredPasswordInModal: '',
      });
    } else {
      // they entered the wrong password
      this.setState({
        wrongPasswordInModal: true,
      })
    }
  }

  // closing the modal
  handleClose() {
    this.setState({
      wrongPasswordInModal: false,
      enteredPasswordInModal: '',
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
      handleClosePasswordConfirm,
    } = this.props;

    const {
      wrongPasswordInModal
    } = this.state;

    return (
      <Modal show={show}>
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
              <Button type="submit" variant="outline-dark" onClick={this.handlePasswordSubmit}>Submit</Button> 
            </Modal.Footer>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}


interface Props {
  alert: any
}

interface State {
  // user info
  username: string,

  // original basic info
  birthDateOriginal: string,
  firstNameOriginal: string,
  lastNameOriginal: string,
  emailOriginal: string,
  phoneNumberOriginal: string,
  
  // original address info
  addressOriginal: string,
  cityOriginal: string,
  stateOriginal: string,
  zipCodeOriginal: string,

  // basic info
  birthDate: string,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,

  // address info
  address: string,
  city: string,
  state: string,
  zipCode: string,

  // password variables
  oldPassword: string,
  enteredPassword: string,
  newPassword: string,
  newPasswordConfirm: string,
  passwordError: PasswordError, 
  
  addressInfoReadOnly: boolean,
  basicInfoReadOnly: boolean,
  passwordChangeReadOnly: boolean,
  
  // for the password modal
  showPasswordConfirm: boolean,
  currentSection: Section,
}

class MyAccount extends Component<Props, State, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {
      // user info
      username: 'client',

      // original basic info
      birthDateOriginal: 'Jan 1, 1990',
      firstNameOriginal: 'Bob',
      lastNameOriginal: 'Smith',
      emailOriginal: 'Bob.Smith@gmail.com',
      phoneNumberOriginal: '123-456-7890',
      
      // original address info
      addressOriginal: "123 Avenue street",
      cityOriginal: "Philadelphia",
      stateOriginal: "PA",
      zipCodeOriginal: "19104",

      // basic info
      birthDate: 'Jan 1, 1990',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'Bob.Smith@gmail.com',
      phoneNumber: '123-456-7890',
      
      // address info
      address: "123 Avenue street",
      city: "Philadelphia",
      state: "PA",
      zipCode: "19104",
      
      // pasword variables
      oldPassword: 'password',
      enteredPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
      passwordError: PasswordError.NoError,

      basicInfoReadOnly: true,
      addressInfoReadOnly: true,
      passwordChangeReadOnly: true,

      // for the password modal (true to show modal)
      showPasswordConfirm: false,
      currentSection: Section.None,
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOpenPasswordConfirmModal = this.handleOpenPasswordConfirmModal.bind(this);
    this.handleSaveInfo = this.handleSaveInfo.bind(this);
    this.handleClosePasswordConfirm = this.handleClosePasswordConfirm.bind(this);
    this.handleCancelEdit = this.handleCancelEdit.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
  }

  handleEdit(event) {
    const name = event.target.name;
    if (name === "editBasicInfo") {
      this.setState({
        basicInfoReadOnly: false,
      });
    } 
    else if (name === "editAddress") {
      this.setState({
        addressInfoReadOnly: false,
      });
    } 
    else if (name === "editPassword") {
      this.setState({
        passwordChangeReadOnly: false,
      });
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    if (name === "enteredPassword" || name === "newPassword" || name === "newPasswordConfirm") {
      this.setState({
        passwordError: PasswordError.NoError,
      })
    }

    const newState = { 
      [name]: value,
    } as Pick<State, keyof State>;
    this.setState(newState);
  }

  // opens up the password confirm modal
  handleOpenPasswordConfirmModal(event) {
    event.preventDefault();

    const section = event.target.name;

    this.setState({
      showPasswordConfirm: true,
      currentSection: section,
    });
  }

  // trigerred after correctly entering password in confirm modal
  handleSaveInfo(section: Section) {
    this.setState({
      showPasswordConfirm: false,
    });

    // TODO: API call to update information
    console.log("API call for this section to update information");
    console.log(section);

    const {
      birthDate,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
    } = this.state;

    // update state information
    if (section === Section.BasicInfo) {
      this.setState({
        basicInfoReadOnly: true,
        birthDateOriginal: birthDate,
        firstNameOriginal: firstName,
        lastNameOriginal: lastName,
        emailOriginal: email,
        phoneNumberOriginal: phoneNumber,
      });
    } else if (section === Section.AddressInfo) {
      this.setState({
        addressInfoReadOnly: true,
        addressOriginal: address,
        cityOriginal: city,
        stateOriginal: state,
        zipCodeOriginal: zipCode,
      });
    }
  }

  // close password confirm modal
  handleClosePasswordConfirm() {
    this.setState({
      showPasswordConfirm: false,
    })
  }

  // cancel the edit
  handleCancelEdit(event) {
    const {
      birthDateOriginal,
      firstNameOriginal,
      lastNameOriginal,
      emailOriginal,
      phoneNumberOriginal,
      addressOriginal,
      cityOriginal,
      stateOriginal,
      zipCodeOriginal,
    } = this.state;

    const section = event.target.name;
    if (section === Section.BasicInfo) {
      this.setState({
        basicInfoReadOnly: true,
        birthDate: birthDateOriginal,
        firstName: firstNameOriginal,
        lastName: lastNameOriginal,
        email: emailOriginal,
        phoneNumber: phoneNumberOriginal,
      });
    }

    else if (section === Section.AddressInfo) {
      this.setState({
        addressInfoReadOnly: true,
        address: addressOriginal,
        city: cityOriginal,
        state: stateOriginal,
        zipCode: zipCodeOriginal,
      })
    } 

    else if (section === Section.PasswordChange) {
      this.setState({
        enteredPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
        passwordChangeReadOnly: true,
        passwordError: PasswordError.NoError,
      })
    }
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
            this.props.alert.show('Successfully changed password');

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
      phoneNumber,
      basicInfoReadOnly,
      address,
      city,
      state,
      zipCode,
      addressInfoReadOnly,
      passwordChangeReadOnly,
      oldPassword,
      enteredPassword,
      newPassword,
      newPasswordConfirm,
      showPasswordConfirm,
      passwordError,
      currentSection,
    } = this.state;

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
            <RenderInput inputLabel={"Username"} inputName={"username"} inputValue={username} readOnly={true} />
          </div>
        </div>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Basic Information</h5>
              { basicInfoReadOnly ? <button type="button" name="editBasicInfo" className="btn btn-outline-dark float-right" onClick={this.handleEdit}>Edit</button>
              : null }
            </div>
            <br></br>
            <form>
              <RenderInput inputLabel={"First Name"} inputName={"firstName"} inputValue={firstName} handleInputChange={this.handleInputChange} readOnly={basicInfoReadOnly} />
              <RenderInput inputLabel={"Last Name"} inputName={"lastName"} inputValue={lastName} handleInputChange={this.handleInputChange} readOnly={basicInfoReadOnly} />
              <RenderInput inputLabel={"Birth Date"} inputName={"birthDate"} inputValue={birthDate} handleInputChange={this.handleInputChange} readOnly={basicInfoReadOnly} />
              <RenderInput inputLabel={"Email"} inputName={"email"} inputValue={email} handleInputChange={this.handleInputChange} readOnly={basicInfoReadOnly} />
              <RenderInput inputLabel={"Phone Number"} inputName={"phoneNumber"} inputValue={phoneNumber} handleInputChange={this.handleInputChange} readOnly={basicInfoReadOnly} />
              <div>
              { basicInfoReadOnly ? null 
                : <span className="float-right">
                  <button type="reset" name={Section.BasicInfo} className="btn btn-light mr-3" onClick={this.handleCancelEdit}>Cancel</button>
                  <button type="submit" className="btn btn-outline-dark" name={Section.BasicInfo} onClick={this.handleOpenPasswordConfirmModal}>Save</button>
                </span>
              }
              </div>
            </form>
          </div>
        </div>
        <ConfirmPasswordModal show={showPasswordConfirm && currentSection == Section.BasicInfo} section={Section.BasicInfo} oldPassword={oldPassword} handleSaveInfo={this.handleSaveInfo} handleClosePasswordConfirm={this.handleClosePasswordConfirm}/>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Address Information</h5>
              <button type="button" name="editAddress" className="btn btn-outline-dark float-right" onClick={this.handleEdit}>Edit</button>
            </div>
            <br></br>
            <form>
              <RenderInput inputLabel={"Address"} inputName={"address"} inputValue={address} handleInputChange={this.handleInputChange} readOnly={addressInfoReadOnly} />
              <RenderInput inputLabel={"City"} inputName={"city"} inputValue={city} handleInputChange={this.handleInputChange} readOnly={addressInfoReadOnly} />
              <div className="row mb-3 mt-3">
                <div className="col-3 card-text mt-2 text-primary-theme">State</div>
                <div className="col-9 card-text">
                  <select className="form-control form-purple"
                        id="state"
                        name="state"
                        value={state}
                        onChange={this.handleInputChange} 
                        disabled={addressInfoReadOnly}>
                        {USStates.map((USState, index) => (<option key={index}>{USState.abbreviation}</option>))}
                  </select>
                </div>
              </div>
              <RenderInput inputLabel={"Zip Code"} inputName={"zipCode"} inputValue={zipCode} handleInputChange={this.handleInputChange} readOnly={addressInfoReadOnly} />
              <div>
              { addressInfoReadOnly ? null 
                : <span className="float-right">
                  <button type="reset" name={Section.AddressInfo} className="btn btn-light mr-3" onClick={this.handleCancelEdit}>Cancel</button>
                  <button type="submit" className="btn btn-outline-dark" name={Section.AddressInfo} onClick={this.handleOpenPasswordConfirmModal}>Save</button>
                </span>
              }
              </div>
            </form>
          </div>
        </div>
        <ConfirmPasswordModal show={showPasswordConfirm && currentSection === Section.AddressInfo} section={Section.AddressInfo} oldPassword={oldPassword} handleSaveInfo={this.handleSaveInfo} handleClosePasswordConfirm={this.handleClosePasswordConfirm}/>

        <div className="card mt-3 mb-3 pl-5 pr-5">
          <div className="card-body">
            <div className="mb-3">
              <h5 className="card-title float-left">Change Password</h5>
              { passwordChangeReadOnly ? <button type="button" name="editPassword" className="btn btn-outline-dark float-right" onClick={this.handleEdit}>Edit</button>
              : null }
            </div>
            <br></br>
            <form>
              { passwordError === PasswordError.OldPasswordWrong ? <p className="text-danger col-md-9 offset-md-3">Old password is incorrect</p> : null }
              <RenderInput inputLabel={"Old password"} passwordType={true} inputName={"enteredPassword"} inputValue={enteredPassword} handleInputChange={this.handleInputChange} readOnly={passwordChangeReadOnly} />
              { passwordError === PasswordError.NewPasswordSameAsOld ? <p className="text-danger col-md-9 offset-md-3">The new password cannot match the old password</p> : null }
              { passwordError === PasswordError.NewPasswordInvalid ? <p className="text-danger col-md-9 offset-md-3">The new password is invalid</p> : null }
              <RenderInput inputLabel={"New password"} passwordType={true} inputName={"newPassword"} inputValue={newPassword} handleInputChange={this.handleInputChange} readOnly={passwordChangeReadOnly} />
              { passwordError === PasswordError.NewPasswordConfirmWrong ? <p className="text-danger col-md-9 offset-md-3">The password does not match the one above</p> : null }
             <RenderInput inputLabel={"Confirm new password"} passwordType={true} inputName={"newPasswordConfirm"} inputValue={newPasswordConfirm} handleInputChange={this.handleInputChange} readOnly={passwordChangeReadOnly} />
              <div>
              { passwordChangeReadOnly ? null 
                : <span className="float-right">
                  <button type="reset" name={Section.PasswordChange} className="btn btn-light mr-3" onClick={this.handleCancelEdit}>Cancel</button>
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
