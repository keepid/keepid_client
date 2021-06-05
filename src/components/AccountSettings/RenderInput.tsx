import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component } from 'react';
import { withAlert } from 'react-alert';
import DatePicker from 'react-datepicker';
import uuid from 'react-uuid';

import getServerURL from '../../serverOverride';
import USStates from '../../static/data/states_titlecase.json';
import ConfirmPasswordModal from './ConfirmPasswordModal';

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
  handleCancel() {
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
        const responseObject = responseJSON;
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

export default withAlert()(RenderInput);
