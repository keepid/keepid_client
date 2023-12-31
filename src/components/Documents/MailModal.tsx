import { Dialog } from '@headlessui/react';
import { stringify } from 'querystring';
import React, { useEffect, useState } from 'react';

import getServerURL from '../../serverOverride';
import { LoadingButton } from '../BaseComponents/Button';
// import {UserContext} from '../../App';

interface Props{
    alert: any;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    mailForm: () => Promise<void>;
    setPrice: (value: string) => void;
    setAddress: (value: string) => void;
    setReturnAddress: (value: string) => void;
    documentName: string;
    price: string;
    address: string;
    returnAddress: string;
}

export const MailModal: React.FC<Props> = ({ alert, isVisible, setIsVisible, mailForm, setPrice, setAddress, setReturnAddress, documentName, price, address, returnAddress }) => {
  // const userInformation = useContext(UserContext); Can use this when org-context is pulled.
  const userInformation = {
    username: 'foo',
    organization: 'bar',
  };

  const [editableAddress, setEditableAddress] = useState(false);
  const [editableReturnAddress, setEditableReturnAddress] = useState(false);
  const [localAddress, setLocalAddress] = useState(address);
  const [localReturnAddress, setLocalReturnAddress] = useState(returnAddress);
  const [localPrice, setLocalPrice] = useState(price);

  const handleAddressChange = (e) => {
    setLocalAddress(e.target.value);
  };

  const handleReturnAddressChange = (e) => {
    setLocalReturnAddress(e.target.value);
  };

  const handleSubmit = async () => {
    // Update the parent component's state
    setAddress(localAddress);
    setReturnAddress(localReturnAddress);
    setIsVisible(false); // Close the modal after submission (optional)
    mailForm();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${getServerURL()}/get-mail-info`, {
          method: 'POST',
          body: JSON.stringify({
            username: userInformation.username,
            organization: userInformation.organization,
            applicationType: documentName,
          }),
        });

        const { status, price, mailAddress, returnAddress } = await response.json();

        if (status === 'SUCCESS') {
          setPrice(price); // Assuming you handle this price state in a parent component
          setLocalPrice(price);
          setLocalAddress(mailAddress); // Set local state
          setLocalReturnAddress(returnAddress); // Set local state
        }
      } catch (err) {
        console.log(err);
        alert.show('Failed to retrieve Address and Price. Please try again.');
      }
    };

    fetchData();
  }, []);

  return (
        <div>
            <Dialog open={isVisible} onClose={() => setIsVisible(false)}>

                <div className="tw-fixed tw-inset-0 tw-bg-black/30" aria-hidden="true" />

                <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-p-4">

                <Dialog.Panel className="tw-m-8 tw-w-[50rem] tw-rounded-md tw-bg-white tw-p-1 tw-px-4 tw-shadow-md">
                <Dialog.Title className="tw-p-4 tw-text-left tw-font-body tw-text-lg">Send application by direct mail?</Dialog.Title>
                <p className="tw-p-2 tw-text-left tw-font-body tw-text-sm">
                    Agreeing to this action will send the application to Team Keep to print and directly mail to the corresponding agency. Your status will be notified through email.
                </p>

                               {/* Price - Not Editable */}
                               <div className="tw-flex tw-justify-between tw-items-center">
                    <label>Price</label>
                    <span>{localPrice}</span>
                               </div>

                {/* Address - Editable */}
                <div className="tw-flex tw-justify-between tw-items-center">
                    <label>Address</label>
                    {editableAddress ? (
                        <input type="text" defaultValue={address} onChange={handleAddressChange} />
                    ) : (
                        <span>{localAddress}</span>
                    )}
                    <button type="button" onClick={() => setEditableAddress(!editableAddress)}>
                        edit
                    </button>
                </div>

                {/* Return Address - Editable */}
                <div className="tw-flex tw-justify-between tw-items-center">
                    <label>Return Address</label>
                    {editableReturnAddress ? (
                        <input type="text" defaultValue={returnAddress} onChange={handleReturnAddressChange} />
                    ) : (
                        <span>{localReturnAddress}</span>
                    )}
                    <button type="button" onClick={() => setEditableReturnAddress(!editableReturnAddress)}>
                        edit
                    </button>
                </div>

                <div className="tw-m-8 tw-mt-10 tw-grid tw-grid-flow-row-dense tw-grid-cols-2 tw-gap-20 sm:tw-gap-60">
                    <LoadingButton onClick={handleSubmit}>Yes, mail </LoadingButton>
                    <button type="button" className="tw-inline-flex tw-items-center tw-border-0 tw-w-full tw-justify-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 sm:tw-col-start-1 sm:tw-mt-0" onClick={() => setIsVisible(false)}>Cancel</button>
                </div>
                <div />
                </Dialog.Panel>
                </div>
            </Dialog>
        </div>
  );
};

interface ConfirmationProps{
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
}

export const MailConfirmation: React.FC<ConfirmationProps> = ({ isVisible, setIsVisible }) => (

    <div>
        <Dialog open={isVisible} onClose={() => setIsVisible(false)}>
        <div className="tw-fixed tw-inset-0 tw-bg-black/30" aria-hidden="true" />

            <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center tw-p-4">
            <Dialog.Panel className="tw-flex tw-flex-col tw-items-center tw-m-20 tw-w-[30rem] tw-rounded-md tw-bg-white tw-p-1 tw-shadow-md">
                <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-green-600 tw-mt-8 tw-mb-2 tw-flex tw-items-center tw-justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-8 tw-h-8 tw-text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                </div>
                <Dialog.Title className="tw-font-body tw-text-lg tw-font-semibold">Sent</Dialog.Title>
                <p className="tw-font-body tw-text-sm tw-text-gray-600 tw-pt-2">
                    Team Keep has recieved your application!
                </p>
                <div className="tw-flex tw-flex-row tw-w-full tw-justify-end tw-p-4 tw-pt-6">
                    <button type="button" className="tw-bg-twprimary tw-border-0 tw-text-white tw-px-3 tw-py-1 tw-rounded-md hover:tw-bg-blue-800" onClick={() => setIsVisible(false)}>Done</button>
                </div>
            </Dialog.Panel>
            </div>
        </Dialog>
    </div>
);
