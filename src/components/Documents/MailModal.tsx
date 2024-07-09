import { Dialog } from '@headlessui/react';
import { PieCanvas } from '@nivo/pie';
import { stringify } from 'querystring';
import React, { useContext, useEffect, useState } from 'react';

import { UserContext } from '../../App';
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
  const { username, organization } = useContext(UserContext);
  const [editableAddress, setEditableAddress] = useState(false);
  const getInitialReturnAddress = () => {
    if (organization === 'Team Keep') {
      return 'Why not Prosper\n1501 Cherry Street\nPhiladelphia, PA 19102';
    }
    return '';
  };
  const [editableReturnAddress, setEditableReturnAddress] = useState(getInitialReturnAddress);
  const [address, setAddress] = useState('');
  const [returnAddress, setReturnAddress] = useState(getInitialReturnAddress);
  const [price, setPrice] = useState('');
  const [inputtedAddress, setInputtedAddress] = useState(false);
  const [inputtedReturn, setInputtedReturn] = useState(false);
  const [showInputError, setShowInputError] = useState(false);
  // inputted_address = true; // doesn't work because its not a variable but a state

  const formatAddress = (address: any): string => {
    if (!address) return '';

    const parts = [
      address.office_name,
      address.street1,
      address.street2,
      `${address.city}, ${address.state} ${address.zipcode}`,
    ].filter((part) => part && part.trim() !== '');

    return parts.join('\n');
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${getServerURL()}/get-form-mail-addresses`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw response data:', data);

      // Log the frontend document name
      console.log('Frontend document name:', documentName);

      // Log all document names from the response
      console.log('Document names in response:');
      Object.entries(data).forEach(([key, value]) => {
        console.log(`${key}: ${(value as any).name}`);
      });

      // Find the matching address based on the document name
      const matchingAddress = Object.entries(data).find(([key, value]) =>
        (value as any).name.toLowerCase().includes(documentName.toLowerCase()));

      if (matchingAddress) {
        const [addressKey, addressDetails] = matchingAddress;
        console.log('Matching address found:', addressKey);
        console.log('Address details:', addressDetails);

        // Log specific details of the address
        console.log('Office Name:', (addressDetails as any).office_name);
        console.log('Street:', (addressDetails as any).street1);
        console.log('City:', (addressDetails as any).city);
        console.log('State:', (addressDetails as any).state);
        console.log('Zipcode:', (addressDetails as any).zipcode);

        // Format the address and set it in state
        const formattedAddress = formatAddress(addressDetails);
        setAddress(formattedAddress);

        console.log('Formatted address:', formattedAddress);
      } else {
        console.warn('No matching address found for document name:', documentName);
        setAddress('');
      }
    } catch (err: any) {
      console.error('Error fetching address:', (err as Error).message);
      alert.show('Failed to retrieve address. Please try again.');
      setAddress('');
    }
  };

  useEffect(() => {
    if (isVisible) {
      console.log(organization);
      fetchData();
      setInputtedAddress(false);
      setInputtedReturn(false);
    }
  }, [isVisible]);

  useEffect(() => {
    console.log('Address updated:', address);
    setInputtedAddress(false);
  }, [address]);

  useEffect(() => {
    console.log('Return Address updated:', returnAddress);
    setInputtedReturn(false);
  }, [returnAddress]);

  const mailForm = async () => {
    if (address === '' || returnAddress === '') {
      // if either address is not valid, put that logic here
      setShowInputError(true);
    } else {
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
        const response = await fetch(`${getServerURL()}/submit-mail`, {
          method: 'POST',
          body: JSON.stringify({
            username,
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
    }
  };

  return (
        <div>
            <Dialog open={isVisible} onClose={() => setIsVisible(false)}>

                <div className="tw-fixed tw-inset-0 tw-bg-black/30" aria-hidden="true" />

                <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center">

                  <Dialog.Panel className="tw-h-auto tw-w-[50rem] tw-flex tw-flex-col tw-bg-white tw-rounded-md tw-shadow-lg">
                    <div className="tw-p-4">
                      <p className="tw-text-left placeholder:tw-font-body tw-text-2xl tw-font-semibold tw-pt-2 tw-pl-2">Please Confirm the following Mail Information</p>
                      {showInputError && <p className="tw-pl-2 tw-text-red-500 tw-font-body tw-text-sm"> Please enter a mail address and return address </p>}
                    </div>
                    <div className="tw-grid tw-grid-cols-3 tw-bg-gray-100 tw-p-4">
                      <label className="tw-pl-2">Address</label>
                        {true ? (
                          <textarea
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                            rows={4}
                            className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded"
                          />
                        ) : (
                          <span className="tw-font-semibold tw-whitespace-pre-wrap">{address}</span>
                        )}
                      {/* <div className="tw-justify-self-end">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-6 tw-h-6 tw-cursor-pointer" onClick={() => setEditableAddress(!editableAddress)}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </div> */}
                    </div>
                    <div className="tw-grid tw-grid-cols-3 tw-p-4">
                      <label className="tw-pl-2">Return Address</label>
                      {true ? (
                        <textarea
                          value={returnAddress}
                          onChange={(event) => setReturnAddress(event.target.value)}
                          rows={4}
                          className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded"
                        />
                      ) : (
                        <span className="tw-font-semibold">{returnAddress}</span>
                      )}
                      {/* <div className="tw-justify-self-end">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-6 tw-h-6 tw-cursor-pointer" onClick={() => setEditableReturnAddress(!editableReturnAddress)}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </div> */}
                    </div>
                    <div className="tw-grid tw-grid-cols-3 tw-bg-gray-100 tw-p-4">
                      <label className="tw-pl-2">Total Price</label>
                      <span className="tw-font-semibold">${price}</span>
                    </div>
                    <div className="tw-m-8 tw-mt-10 tw-grid tw-grid-flow-row-dense tw-grid-cols-3 tw-gap-60 sm:tw-gap-60">
                      <button type="button" className="tw-inline-flex tw-w-full tw-justify-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 tw-sm:tw-col-start-1 tw-sm:tw-mt-0" onClick={() => setIsVisible(false)}>Cancel</button>
                      <div />
                      <LoadingButton onClick={mailForm}>Yes, mail </LoadingButton>
                    </div>
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
