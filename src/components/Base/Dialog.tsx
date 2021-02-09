import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
// import SaveSVG from '../../static/images/check.svg';
// import EditSVG from '../../static/images/edit.svg';
import DeleteSVG from '../../static/images/delete.svg';
// import ArrowSVG from '../../static/images/down-arrow.svg';

interface Props {
  modalType: string,
//   modalSize: string,
  modalTitle: string,
  modalDescription: string,
  modalIcon: string,
  // handleClose: (event: any) => void,
  // handleShow: (event:any) => void,
}

// This is a "functional" component, rather than a "class" component
const Dialog = ({
  modalType,
  modalTitle,
  modalDescription,
  modalIcon: modalIconProp,
//   modalSize,
  // handleClose,
  // handleShow,
}: Props) => {
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let modalIcon = modalIconProp;

  if (modalType === 'CONFIRM') {
    modalIcon = DeleteSVG;
    return (
      <>
        <Button variant="primary" onClick={handleShow}>Launch Modal</Button>
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          animation={false}
          centered
          size="xl"
        >
          <Modal.Header className="no-border" closeButton>
            <Image className="ml-3 mt-3" src={modalIcon} />
            <Modal.Title className="ml-3 mt-3">{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="ml-3 mr-4">
            {modalDescription}
          </Modal.Body>
          <Modal.Footer className="no-border">
            <Button className="mb-3" variant="cancel" onClick={handleClose}>Cancel</Button>
            <Button className="mb-3 mr-4" variant="primary">Confirm Action</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  } if (modalType === 'DELETE') {
    modalIcon = DeleteSVG;
    return (
      <>
        <Button variant="primary" onClick={handleShow}>Launch Modal</Button>
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          animation={false}
          centered
          size="xl"
        >
          <Modal.Header className="no-border" closeButton>
            <Image className="ml-3 mt-3" src={modalIcon} />
            <Modal.Title className="ml-3 mt-3">{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="ml-3 mr-4">
            {modalDescription}
          </Modal.Body>
          <Modal.Footer className="no-border">
            <Button className="mb-3" variant="cancel" onClick={handleClose}>Cancel</Button>
            <Button className="mb-3 mr-4" variant="delete">Confirm Action</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  } if (modalType === 'INFO') {
    modalIcon = DeleteSVG;
    return (
      <>
        <Button variant="primary" onClick={handleShow}>Launch Modal</Button>
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          animation={false}
          centered
          size="xl"
        >
          <Modal.Header className="no-border" closeButton>
            <Image className="ml-3 mt-3" src={modalIcon} />
            <Modal.Title className="ml-3 mt-3">{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="ml-3 mr-4">
            {modalDescription}
          </Modal.Body>
          <Modal.Footer className="no-border">
            <Button className="mb-3" variant="cancel" onClick={handleClose}>Cancel</Button>
            <Button className="mb-3 mr-4" variant="primary">Confirm Action</Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>Launch Modal</Button>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        animation={false}
        centered
        size="xl"
      >
        <Modal.Header className="no-border" closeButton>
          <Image className="ml-3 mt-3" src={modalIcon} />
          <Modal.Title className="ml-3 mt-3">{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="no-border">
          {modalDescription}
        </Modal.Body>
        <Modal.Footer className="no-border">
          <Button className="mb-3" variant="cancel" onClick={handleClose}>Cancel</Button>
          <Button className="mb-3 mr-4" variant="primary">Confirm Action</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dialog;
