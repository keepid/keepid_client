import { Dialog } from '@headlessui/react';
import { PieCanvas } from '@nivo/pie';
import { stringify } from 'querystring';
import React, { useContext, useEffect, useRef, useState } from 'react';

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

interface AddressData {
  nameForCheck: string;
  officeName: string;
  state: string;
  street1: string;
  street2: string;
  city: string;
  zipcode: string;
  description?: string;
  name?: string;
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
  const [addressData, setAddressData] = useState<AddressData>({
    nameForCheck: '',
    officeName: '',
    state: '',
    street1: '',
    street2: '',
    city: '',
    zipcode: '',
    description: '',
    name: '',
  });

  const [returnAddressData, setReturnAddressData] = useState<AddressData>({
    nameForCheck: '',
    officeName: '',
    state: '',
    street1: '',
    street2: '',
    city: '',
    zipcode: '',
    description: '',
    name: '',
  });

  const [price, setPrice] = useState('');
  const [showInputError, setShowInputError] = useState(false);

  const getInitialReturnAddress = (): AddressData => {
    if (organization === 'Team Keep') {
      return {
        nameForCheck: '',
        officeName: 'Team Keep',
        street1: '520 Carpenter Ln',
        street2: 'COMM',
        city: 'Philadelphia',
        state: 'PA',
        zipcode: '19119',
        description: '',
        name: '',
      };
    } if (organization === 'Why not Prosper') {
      return {
        nameForCheck: '',
        officeName: 'Why Not Prosper',
        street1: '717 E Chelten Ave',
        street2: '',
        city: 'Philadelphia',
        state: 'PA',
        zipcode: '19144',
        description: '',
        name: '',
      };
    }
    return {
      nameForCheck: '',
      officeName: '',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipcode: '',
      description: '',
      name: '',
    };
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleQuestionMarkHover = () => {
    setShowTooltip(true);
  };

  useEffect(() => {
    setReturnAddressData(getInitialReturnAddress());
  }, [organization]);

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

      // Find the matching address based on the document name
      const matchingAddress = Object.entries(data).find(([key, value]) =>
        (value as any).name.toLowerCase().includes(documentName.toLowerCase()));

      if (matchingAddress) {
        const [addressKey, addressDetails] = matchingAddress;
        console.log('Matching address found:', addressKey);
        console.log('Address details:', addressDetails);

        // Set the address data
        setAddressData({
          nameForCheck: (addressDetails as any).name_for_check || '',
          officeName: (addressDetails as any).office_name || '',
          state: (addressDetails as any).state || '',
          street1: (addressDetails as any).street1 || '',
          street2: (addressDetails as any).street2 || '',
          city: (addressDetails as any).city || '', // Include city
          zipcode: (addressDetails as any).zipcode || '',
          description: (addressDetails as any).description || '',
          name: (addressDetails as any).name || '',
        });
      } else {
        console.warn('No matching address found for document name:', documentName);
        setAddressData({
          nameForCheck: '',
          officeName: '',
          state: '',
          street1: '',
          street2: '',
          city: '',
          zipcode: '',
          description: '',
          name: '',
        });
      }
    } catch (err: any) {
      console.error('Error fetching address:', (err as Error).message);
      alert.show('Failed to retrieve address. Please try again.');
      setAddressData({
        nameForCheck: '',
        officeName: '',
        state: '',
        street1: '',
        street2: '',
        city: '',
        zipcode: '',
        description: '',
        name: '',
      });
    }
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setShowInputError(false); // Clear the error message
  };

  useEffect(() => {
    if (isVisible) {
      console.log(organization);
      fetchData();
      setShowInputError(false); // Clear any previous error messages
    }
  }, [isVisible]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>, isReturnAddress: boolean) => {
    const { name, value } = e.target;
    if (isReturnAddress) {
      setReturnAddressData((prev) => ({ ...prev, [name]: value }));
    } else {
      setAddressData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const mailForm = async () => {
    const requiredFields = ['officeName', 'street1', 'city', 'state', 'zipcode'];
    const isAddressValid = requiredFields.every((field) => addressData[field] !== '');
    const isReturnAddressValid = requiredFields.every((field) => returnAddressData[field] !== '');

    if (!isAddressValid || !isReturnAddressValid) {
      setShowInputError(true);
    } else {
      setShowInputError(false);
      const today = new Date();
      const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

      try {
        const response = await fetch(`${getServerURL()}/submit-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: targetUser,
            fileId: documentId,
            mailAddress: {
              name: addressData.name || '',
              description: `Document Name: ${documentName}, Document Date: ${documentDate}, Document Uploader: ${documentUploader}, Submission Date: ${date}`,
              office_name: addressData.officeName,
              name_for_check: addressData.nameForCheck,
              street1: addressData.street1,
              street2: addressData.street2,
              city: addressData.city,
              state: addressData.state,
              zipcode: addressData.zipcode,
            },
            returnAddress: returnAddressData,
            price,
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

  const renderAddressFields = (data: AddressData, isReturnAddress: boolean) => (
    <div className="tw-space-y-4 tw-p-4">
      <div>
        <label className="tw-block tw-mb-1 tw-font-semibold">Office Name</label>
        <input
          type="text"
          name="officeName"
          value={data.officeName}
          onChange={(e) => handleAddressChange(e, isReturnAddress)}
          className={`tw-w-full tw-p-2 tw-border ${showInputError && data.officeName
             === '' ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded`}
          placeholder="Enter office name"
        />
      </div>

      <div>
        <label className="tw-block tw-mb-1 tw-font-semibold">Address</label>
        <input
          type="text"
          name="street1"
          value={data.street1}
          onChange={(e) => handleAddressChange(e, isReturnAddress)}
          className={`tw-w-full tw-p-2 tw-border ${showInputError && data.street1 === '' ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded tw-mb-2`}
          placeholder="Street Address or P.O. Box"
        />
        <input
          type="text"
          name="street2"
          value={data.street2}
          onChange={(e) => handleAddressChange(e, isReturnAddress)}
          className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded"
          placeholder="Apt, suite, building, floor, etc. (optional)"
        />
      </div>

      <div className="tw-flex tw-space-x-2">
        <div className="tw-flex-grow">
          <label className="tw-block tw-mb-1 tw-font-semibold">City</label>
          <input
            type="text"
            name="city"
            value={data.city}
            onChange={(e) => handleAddressChange(e, isReturnAddress)}
            className={`tw-w-full tw-p-2 tw-border ${showInputError && data.city === '' ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded`}
            placeholder="E.g. Philadelphia"
          />
        </div>
        <div className="tw-w-20">
          <label className="tw-block tw-mb-1 tw-font-semibold">State</label>
          <input
            type="text"
            name="state"
            value={data.state}
            onChange={(e) => handleAddressChange(e, isReturnAddress)}
            className={`tw-w-full tw-p-2 tw-border ${showInputError && data.state === '' ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded`}
            placeholder="E.g. PA"
          />
        </div>
        <div className="tw-w-32">
          <label className="tw-block tw-mb-1 tw-font-semibold">ZIP code</label>
          <input
            type="text"
            name="zipcode"
            value={data.zipcode}
            onChange={(e) => handleAddressChange(e, isReturnAddress)}
            className={`tw-w-full tw-p-2 tw-border ${showInputError && data.zipcode === '' ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded`}
            placeholder="5 digit ZIP code"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Dialog open={isVisible} onClose={() => setIsVisible(false)}>
        <div className="tw-fixed tw-inset-0 tw-bg-black/30" aria-hidden="true" />
        <div className="tw-fixed tw-inset-0 tw-flex tw-items-center tw-justify-center">
          <Dialog.Panel className="tw-h-[86vh] tw-w-[50rem] tw-flex tw-flex-col tw-bg-white tw-rounded-md tw-shadow-lg tw-relative tw-overflow-hidden">
            <Dialog.Panel className="tw-h-[86vh] tw-w-[50rem] tw-flex tw-flex-col tw-bg-white tw-rounded-md tw-shadow-lg tw-relative tw-overflow-hidden">
                <div className="tw-overflow-y-auto tw-flex-grow">
                <div className="tw-p-4">
                  <p className="tw-text-left placeholder:tw-font-body tw-text-2xl tw-font-semibold tw-pt-2 tw-pl-2">Please Confirm the following Mail Information</p>
                  {showInputError && <p className="tw-pl-2 tw-text-red-500 tw-font-body tw-text-sm"> Please fill in all address fields </p>}
                </div>
                <div className="tw-bg-gray-100">
                  <h3 className="tw-text-lg tw-font-semibold tw-p-2 tw-flex tw-items-center tw-relative">
                    Mailing Address
                    <span
                      className="tw-ml-2 tw-cursor-help tw-relative"
                      onMouseEnter={handleQuestionMarkHover}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-5 tw-h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                      {showTooltip && (
                        <div
                          ref={tooltipRef}
                          className="tw-absolute tw-bg-black tw-text-white tw-p-2 tw-rounded tw-text-sm tw-z-50 tw-w-64"
                          style={{ top: 'calc(100% + 10px)', left: 'calc(100% - 20px)', transform: 'translateX(-100%)' }}
                        >
                          The addresses has been prepopulated based on the form name and your registered organization
                        </div>
                      )}
                    </span>
                  </h3>
                  {renderAddressFields(addressData, false)}
                </div>
                <div>
                  <h3 className="tw-text-lg tw-font-semibold tw-p-2">Return Address</h3>
                  {renderAddressFields(returnAddressData, true)}
                </div>
                <div className="tw-grid tw-grid-cols-3 tw-bg-gray-100 tw-p-4">
                  <label className="tw-pl-2">Total Price</label>
                  <span className="tw-font-semibold">${price}</span>
                </div>
                <div className="tw-grid tw-grid-cols-3 tw-p-4">
                  <label className="tw-pl-2">Name for Check</label>
                  <input
                    type="text"
                    name="nameForCheck"
                    value={addressData.nameForCheck}
                    onChange={(e) => handleAddressChange(e, false)}
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded"
                  />
                </div>
                <div className="tw-m-8 tw-mt-10 tw-grid tw-grid-flow-row-dense tw-grid-cols-3 tw-gap-60 sm:tw-gap-60">
                <button type="button" className="tw-inline-flex tw-w-full tw-justify-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50 tw-sm:tw-col-start-1 tw-sm:tw-mt-0" onClick={handleCloseModal}>Cancel</button>
                  <div />
                  <LoadingButton onClick={mailForm}>Yes, mail</LoadingButton>
                </div>
                </div>
            </Dialog.Panel>
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
