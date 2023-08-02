import React from 'react';
import Modal from 'react-bootstrap/Modal';

interface Props {
    showModal: boolean,
    handleClose: () => void,
    handleLogout: () => void,
}

function IdleTimeOutModal(props: Props): React.ReactElement {
  const { showModal, handleClose, handleLogout } = props;
  return (
    <Modal show={showModal} data-testid="warn-modal">
      <Modal.Header>
        <Modal.Title>You have been idle for some time...</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You will be automatically logged off soon.</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" onClick={handleClose} className="btn btn-primary">Stay</button>
        <button type="button" onClick={handleLogout} className="btn btn-danger">Log Out</button>
      </Modal.Footer>
    </Modal>
  );
}

export default IdleTimeOutModal;
