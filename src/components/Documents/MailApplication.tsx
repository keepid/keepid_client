import React from 'react';
import Modal from 'react-modal';

interface Props {
    showPopup: boolean;
    onClosePopup: () => void;
}

Modal.setAppElement('#root'); // replace '#root' with the id of your app's main div

function MailApplication({ showPopup, onClosePopup }: Props) {
  return (
        <Modal
          isOpen={showPopup}
          onRequestClose={onClosePopup}
          contentLabel="Example Modal"
        >
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                Address
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="address" type="text" placeholder="Address" />
            <button type="button" className="btn btn-outline-success"> Submit! </button>
            <button type="button" className="btn btn-outline-success" onClick={onClosePopup}> Close Popup </button>
        </Modal>
  );
}

export default MailApplication;
