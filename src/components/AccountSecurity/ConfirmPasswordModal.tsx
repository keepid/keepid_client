import React, { Component } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { withAlert } from 'react-alert';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

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

export default withAlert()(ConfirmPasswordModal);
