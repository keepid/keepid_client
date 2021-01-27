import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

interface Props {
  modalType: string,
  modalSize: string,
  modalTitle: string,
  modalIcon: string,
  handleClose: (event: any) => void,
  handleShow: (event:any) => void,
}

interface State {
  showModal: boolean,
}

class Dialogue extends React.Component<Props, State, {}> {
  handleClose = (event: any):void => {
    event.preventDefault();
    this.setState({
      showModal: false,
    });
  }

  handleShow = (event: any):void => {
    event.preventDefault();
    this.setState({
      showModal: true,
    });
  }

  render() {
    // const [show, setShow] = React.useState(false);
    // const handleClose = () => setShow(false);
    // const handleShow = () => setShow(true);

    const {
      modalType,
      modalTitle,
      handleClose,
      handleShow,
    } = this.props;

    let {
      modalIcon,
    } = this.props;

    const {
      showModal,
    } = this.state;

    if (modalType === 'CONFIRM') {
      modalIcon = '';
    } else if (modalType === 'DELETE') {
      modalIcon = '';
    } else if (modalType === 'SAVE') {
      modalIcon = '';
    }
    return (
      <>
        <Button variant="primary" onClick={handleShow}>
          Launch static backdrop modal
        </Button>
        {showModal
          ? (
            <Modal
              show
              onHide={handleClose}
              backdrop="static"
              keyboard={false}
              animation={false}
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header>
                <Modal.Title>{modalTitle}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="row mb-3 mt-3">
                  <div className="col">
                    `This is irreversible. Are you sure you want to delete all the data for row ?`
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={handleClose}>Cancel</button>
              </Modal.Footer>
            </Modal>
          ) : null}
      </>
    );
  }
  /*
  render() {
    const [show, setShow] = React.useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
      <>
        <Button variant="primary" onClick={handleShow}>Launch Modal</Button>
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
          animation={false}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Modal title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            I will not close if you click outside me. Don&apos;t even try to press escape key.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button variant="primary">Confirm Action</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  */
}

export default Dialogue;
