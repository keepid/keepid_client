import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

import React, { useState } from 'react';
import { withAlert } from 'react-alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

// modal for confirming password before updating information
interface Props {
  show: boolean,
  wrongPasswordInModal: boolean,
  buttonState: string,
  handleSaveInfo(password: string): any,
  handleClosePasswordConfirm(): any,
}

interface State {
  enteredPasswordInModal: string,
}

const ConfirmPasswordModal = (props: Props) => {
  const [enteredPasswordInModal, setEnteredPasswordInModal] = useState<State['enteredPasswordInModal']>('');

  // entering password in modal
  const handlePasswordInput = (event) => {
    setEnteredPasswordInModal(event.target.value);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const { handleSaveInfo } = props;
    // this function makes API call
    handleSaveInfo(enteredPasswordInModal);
  };

  // closing the modal
  const handleClose = () => {
    setEnteredPasswordInModal('');
    const { handleClosePasswordConfirm } = props;
    handleClosePasswordConfirm();
  };

  const {
    show,
    buttonState,
    wrongPasswordInModal,
  } = props;

  return (
    <Modal show={show} backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Confirm Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <p>Please enter your password to make these changes.</p>
          { wrongPasswordInModal ? <p className="text-danger">Password is incorrect</p> : null }
          <input type="password" className={wrongPasswordInModal ? 'form-control form-red' : 'form-control form-purple'} name="passwordConfirm" id="passwordConfirm" onChange={handlePasswordInput} />
          <Modal.Footer>
            <Button type="button" variant="light" onClick={handleClose}>Cancel</Button>
            <Button type="submit" className={`ld-ext-right ${buttonState}`} variant="outline-dark" onClick={handlePasswordSubmit}>
              Submit
              <div className="ld ld-ring ld-spin" />
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default withAlert()(ConfirmPasswordModal);
