import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { Component, useEffect, useState } from 'react';
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
const RenderInput = (props: InputProps) => {
  const [readOnly, setReadOnly] = useState<InputState['readOnly']>(true);
  const [input, setInput] = useState<InputState['input']>('');
  const [originalInput, setOriginalInput] = useState<InputState['originalInput']>('');
  const [wrongPasswordInModal, setWrongPasswordInModal] = useState<InputState['wrongPasswordInModal']>(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<InputState['showPasswordConfirm']>(false);
  const [buttonState, setButtonState] = useState('');

  const birthDateString = (birthDate) => {
    const personBirthMonth = birthDate.getMonth() + 1;
    const personBirthMonthString = (personBirthMonth < 10 ? `0${personBirthMonth}` : personBirthMonth);
    const personBirthDay = birthDate.getDate();
    const personBirthDayString = (personBirthDay < 10 ? `0${personBirthDay}` : personBirthDay);
    const personBirthDateFormatted = `${personBirthMonthString}-${personBirthDayString}-${birthDate.getFullYear()}`;
    return personBirthDateFormatted;
  };

  useEffect(() => {
    const { inputValue } = props;
    setInput(inputValue);
    setOriginalInput(inputValue);
  });

  // edit input
  const handleEdit = () => {
    setReadOnly(false);
  };

  // cancel the edit
  const handleCancel = () => {
    setReadOnly(true);
    setInput(originalInput);
  };

  const handleSetReadOnly = () => {
    setReadOnly(true);
  };

  const handleInputChange = (event) => {
    const { inputType } = props;
    if (inputType === 'date') {
      setInput(event);
    } else {
      setInput(event.target.value);
    }
  };

  // opens up the password confirm modal
  const handleOpenPasswordConfirmModal = (event) => {
    event.preventDefault();
    setShowPasswordConfirm(true);
  };

  // close password confirm modal
  const handleClosePasswordConfirm = () => {
    setWrongPasswordInModal(false);
    setShowPasswordConfirm(false);
    setButtonState('');
  };

  // trigerred after correctly entering password in confirm modal
  const handleSaveInfo = (password: string) => {
    setButtonState('running');
    const {
      inputName,
      inputLabel,
      alert,
      inputType,
    } = props;

    // API call to update information
    const data = {
      key: inputName,
      value: inputType === 'date' ? birthDateString(input) : input,
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
          setOriginalInput(input);
          setShowPasswordConfirm(false);
          setWrongPasswordInModal(false);
          setReadOnly(true);
        } else if (status === 'AUTH_FAILURE') {
          // wrong password
          setWrongPasswordInModal(true);
        } else {
          alert.show(`Failed to update ${inputLabel}: ${message}`);
          setShowPasswordConfirm(false);
          setWrongPasswordInModal(false);
        }
        setButtonState('');
      });
  };

  const {
    inputLabel,
    inputName,
    inputType,
  } = props;

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
                onChange={handleInputChange}
                disabled={readOnly}
              >
                {USStates.map((USState) => (<option key={uuid()}>{USState.abbreviation}</option>))}
              </select>
            ) : null}
          { inputType === 'text' || inputType === 'tel'
            ? <input type={inputType} className="form-control form-purple" name={inputName} id={inputName} value={input} onChange={handleInputChange} readOnly={readOnly} />
            : null}
          { inputType === 'date' ? (
            <DatePicker
              id={inputName}
              onChange={handleInputChange}
              selected={input}
              className="form-control form-purple"
              readOnly={readOnly}
            />
          ) : null}
        </div>
        <div className="col-3">
          { readOnly ? <button type="button" name={inputName} className="btn btn-outline-dark float-right" onClick={handleEdit}>Edit</button>
            : (
              <span className="float-right">
                <button type="button" name={inputName} className="btn btn-light mr-3" onClick={handleCancel}>Cancel</button>
                <button type="submit" name={inputName} className="btn btn-outline-dark" onClick={handleOpenPasswordConfirmModal}>Save</button>
              </span>
            )}
        </div>
        <ConfirmPasswordModal show={showPasswordConfirm} section={inputName} buttonState={buttonState} wrongPasswordInModal={wrongPasswordInModal} handleSaveInfo={handleSaveInfo} handleClosePasswordConfirm={handleClosePasswordConfirm} />
      </div>
  );
};

export default withAlert()(RenderInput);
