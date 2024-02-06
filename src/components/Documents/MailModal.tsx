import { Dialog } from '@headlessui/react';
import { PieCanvas } from '@nivo/pie';
import { stringify } from 'querystring';
import React, { useEffect, useState } from 'react';

import getServerURL from '../../serverOverride';
import { LoadingButton } from '../BaseComponents/Button';
// import {UserContext} from '../../App';

interface Props{
    alert: any;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    showMailSuccess: boolean;
    setShowMailSuccess: (value: boolean) => void;
    userRole: string;
    documentId: string;
    targetUser: string;
    documentDate: string;
    documentUploader: string;
    documentName: string;
}

export const MailModal: React.FC<Props> = ({
  alert,
  isVisible,
  setIsVisible,
  showMailSuccess,
  setShowMailSuccess,
  userRole,
  targetUser,
  documentId,
  documentDate,
  documentUploader,
  documentName,
}) => {
  // const userInformation = useContext(UserContext); Can use this when org-context is pulled.
  const userInformation = {
    username: 'foo',
    organization: 'bar',
  };

  const [editableAddress, setEditableAddress] = useState(false);
  const [editableReturnAddress, setEditableReturnAddress] = useState(false);
  const [address, setAddress] = useState('');
  const [returnAddress, setReturnAddress] = useState('');
  const [price, setPrice] = useState('');

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

        const responseData = await response.json();

        // Log the entire parsed JSON response
        console.log(responseData);
        const { status, price, mailAddress, returnAddress } = responseData;

        console.log('hello');
        if (status === 'SUCCESS') {
          setPrice(price); // Assuming you handle this price state in a parent component
          setAddress(mailAddress); // Set local state
          setReturnAddress(returnAddress); // Set local state
        }
      } catch (err) {
        console.log(err);
        alert.show('Failed to retrieve Address and Price. Please try again.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Code to run when `address` changes
    console.log('Address updated:', address);

    // You can also call any function here that needs to run after `address` is updated
  }, [address]);

  useEffect(() => {
    // Code to run when `returnAddress` changes
    console.log('Return Address updated:', returnAddress);

    // Similarly, call any function here that needs to run after `returnAddress` is updated
  }, [returnAddress]);

  const mailForm = async () => {
    const today = new Date();
    const date = `${`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`}' '${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

    const description = `
      User Role: ${userRole}
      Target User: ${targetUser}
      Document Name: ${documentName}
      Document ID: ${documentId}
      DocumentDate: ${documentDate}
      DocumentUploader: ${documentUploader}
      price: ${price}
      mailAddress: ${address}
      returnAddress: ${returnAddress}
      Submission Date: ${date}`;

    try {
      const response = await fetch(`${getServerURL()}/mail-file`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'foo@email.com',
          title: 'Mail Submission',
          fileId: documentId,
          price,
          mailAddress: address,
          returnAddress,
          description,
        }),
      });

      const responseJSON = await response.json();
      const { status } = responseJSON;

      if (status === 'SUCCESS') {
        setIsVisible(false);
        setShowMailSuccess(true);
      } else {
        setIsVisible(false);
        alert.show('Failed to submit. Please try another time.');
      }
    } catch (error) {
      setIsVisible(false);
      alert.show('Failed to submit. Please try again.');
    }
  };

  return (
        <div>
            <Dialog open={isVisible} onClose={() => setIsVisible(false)}>

                <div className="tw-fixed tw-inset-0 tw-bg-black/30" aria-hidden="true" />

                <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center">

                  <Dialog.Panel className="tw-h-auto tw-w-[96rem] tw-flex tw-flex-col tw-bg-white tw-rounded-md tw-shadow-lg">
                    <div className="tw-p-4">
                      <p className="tw-text-left placeholder:tw-font-body tw-text-2xl">Please Confirm the following Mail Information</p>
                    </div>
                    <div className="tw-bg-gray-50 tw-p-4">
                      <p className="tw-text-left placeholder:tw-font-body tw-text-xl">Price</p>
                    </div>
                    <div className="tw-p-4">
                      <p className="tw-text-left placeholder:tw-font-body tw-text-xl">Address</p>
                    </div>
                    <div className="tw-bg-gray-50 tw-p-4">
                      <p className="tw-text-left placeholder:tw-font-body tw-text-xl">Return Address</p>
                    </div>
                    <div className="tw-m-8 tw-sm:tw-mt-6 tw-sm:tw-grid tw-sm:tw-grid-flow-row-dense tw-sm:tw-grid-cols-2 tw-sm:tw-gap-3">
                      <LoadingButton onClick={mailForm}>Yes, mail </LoadingButton>
                      <button type="button" className="tw-mt-3 tw-inline-flex tw-w-full tw-justify-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 tw-sm:tw-col-start-1 tw-sm:tw-mt-0" onClick={() => setIsVisible(false)}>Cancel</button>
                    </div>
                  </Dialog.Panel>

                {/* <Dialog.Panel className="tw-w-[50rem] tw-rounded-md tw-bg-white tw-p-1 tw-px-4 tw-shadow-md">
                <Dialog.Title className="tw-p-4 tw-text-left tw-font-body tw-text-lg">Please Confirm the following Mail Information</Dialog.Title>

                <div className="tw-flex tw-flex-col">
                    <div className="tw-flex tw-justify-between tw-items-center tw-font-body tw-text-md tw-bg-gray-100">
                      <label>Price</label>
                      <span>{price}</span>
                    </div>

                  <div className="tw-flex tw-justify-between tw-items-center tw-font-body tw-text-md">
                      <label>Address</label>
                      {editableAddress ? (
                          <input
                            type="text"
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                          />
                      ) : (
                          <span>{address}</span>
                      )}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="tw-w-6 tw-h-6 tw-cursor-pointer" onClick={() => setEditableAddress(!editableAddress)}>
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg >
                  </div>

                  <div className="tw-flex tw-justify-between tw-items-center tw-font-body tw-text-md tw-bg-gray-100">
                      <label>Return Address</label>
                      {editableReturnAddress ? (
                          <input
                            type="text"
                            value={returnAddress}
                            onChange={(event) => setReturnAddress(event.target.value)}
                          />
                      ) : (
                          <span>{returnAddress}</span>
                      )}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="tw-w-6 tw-h-6 tw-cursor-pointer" onClick={() => setEditableReturnAddress(!editableReturnAddress)}>
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg >
                  </div>

                  <div className="tw-m-8 tw-mt-10 tw-grid tw-grid-flow-row-dense tw-grid-cols-2 tw-gap-20 sm:tw-gap-60">
                      <LoadingButton onClick={mailForm}>Yes, mail </LoadingButton>
                      <button type="button" className="tw-inline-flex tw-items-center tw-border-0 tw-w-full tw-justify-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 sm:tw-col-start-1 sm:tw-mt-0" onClick={() => setIsVisible(false)}>Cancel</button>
                  </div>
                  <div />
                  </div>
                </Dialog.Panel> */}
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
