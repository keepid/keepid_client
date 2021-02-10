import React from 'react';
import Modal from 'react-bootstrap/Modal';

interface TModalProps {
  row: any,
  handleClickClose: (event: any) => void,
  handleDelete: (event: any) => void,
}

export default function TModal(props: TModalProps): React.ReactElement {
  return (
    <Modal key="deleteRow" show>
      <Modal.Header>
        <Modal.Title>Delete Row</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row mb-3 mt-3">
          <div className="col">
            {`This is irreversible. Are you sure you want to delete all the data for row ${props.row.id}?`}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-danger" onClick={props.handleDelete}>Delete</button>
        <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={props.handleClickClose}>Cancel</button>
      </Modal.Footer>
    </Modal>
  );
}
