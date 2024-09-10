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
  index: string;
  nameForCheck: string;
  officeName: string;
  state: string;
  street1: string;
  street2: string;
  city: string;
  zipcode: string;
  description?: string;
  name?: string;
  checkAmount: string;
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
  const [isAddressSelectorOpen, setAddressSelectorOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData>({
    index: '',
    nameForCheck: '',
    officeName: '',
    state: '',
    street1: '',
    street2: '',
    city: '',
    zipcode: '',
    description: '',
    name: '',
    checkAmount: ''
  });
  const [allAddressData, setAllAddressData] = useState<AddressData[]>([]);

  const [returnAddressData, setReturnAddressData] = useState<AddressData>({
    index: '',
    nameForCheck: '',
    officeName: '',
    state: '',
    street1: '',
    street2: '',
    city: '',
    zipcode: '',
    description: '',
    name: '',
    checkAmount: ''
  });

  const [price, setPrice] = useState('');
  const [showInputError, setShowInputError] = useState(false);

  const getInitialReturnAddress = (): AddressData => {
    if (organization === 'Team Keep') {
      return {
        index: 'TEAM_KEEP',
        nameForCheck: '',
        officeName: 'Team Keep',
        street1: '520 Carpenter Ln',
        street2: 'COMM',
        city: 'Philadelphia',
        state: 'PA',
        zipcode: '19119',
        description: '',
        name: '',
        checkAmount: ''
      };
    } if (organization === 'Why not Prosper') {
      return {
        index: 'WHY_NOT_PROSPER',
        nameForCheck: '',
        officeName: 'Why Not Prosper',
        street1: '717 E Chelten Ave',
        street2: '',
        city: 'Philadelphia',
        state: 'PA',
        zipcode: '19144',
        description: '',
        name: '',
        checkAmount: ''
      };
    }
    return {
      index: '',
      nameForCheck: '',
      officeName: '',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zipcode: '',
      description: '',
      name: '',
      checkAmount: ''
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
      
      const transformedData = Object.keys(data).map((key) => ({
        index: key,
        nameForCheck: data[key].name_for_check,
        officeName: data[key].office_name,
        state: data[key].state,
        street1: data[key].street1,
        street2: data[key].street2,
        city: data[key].city,
        zipcode: data[key].zipcode,
        description: data[key].description,
        name: data[key].name,
        checkAmount: data[key].check_amount,
      }));

      setAllAddressData(transformedData);
    } catch (err: any) {
      console.error('Error fetching address:', (err as Error).message);
      alert.show('Failed to retrieve address. Please try again.');
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
      setSelectedAddress((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDropdownToggle = () => {
    setAddressSelectorOpen(!isAddressSelectorOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedAddress(option);
    setAddressSelectorOpen(false);
  };

  const mailForm = async () => {
    const requiredFields = ['officeName', 'street1', 'city', 'state', 'zipcode'];
    const isAddressValid = requiredFields.every((field) => selectedAddress[field] !== '');
    const isReturnAddressValid = requiredFields.every((field) => returnAddressData[field] !== '');

    if (!isAddressValid || !isReturnAddressValid) {
      setShowInputError(true);
    } else {
      setShowInputError(false);
      const today = new Date();
      const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

      try {
        console.log("TRYING MAIL SUBMISSION with: ", documentId)
        const response = await fetch(`${getServerURL()}/submit-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            username: targetUser,
            fileId: documentId,
            mailKey: selectedAddress.index,
            mailAddress: {
              name: selectedAddress.name || '',
              description: `Document Name: ${documentName}, Document Date: ${documentDate}, Document Uploader: ${documentUploader}, Submission Date: ${date}`,
              office_name: selectedAddress.officeName,
              name_for_check: selectedAddress.nameForCheck,
              street1: selectedAddress.street1,
              street2: selectedAddress.street2,
              city: selectedAddress.city,
              state: selectedAddress.state,
              zipcode: selectedAddress.zipcode,
            },
            returnAddress: returnAddressData,
            price,
          }),
        });

        const responseJSON = await response.json();
        const { status } = responseJSON;

        if (status === 'MAIL_SUCCESS') {
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
                  <p className="tw-text-left tw-text-2xl tw-font-semibold">Please Select your target Mail Address</p>
                  
                  <div className="tw-relative tw-w-full">
                    <div
                      className={`tw-relative tw-w-full tw-border tw-rounded-md tw-bg-gray-100 tw-p-3 tw-cursor-pointer tw-flex tw-items-center tw-justify-between hover:tw-bg-gray-200 ${
                        isAddressSelectorOpen ? 'tw-ring-2 tw-ring-indigo-500' : ''
                      }`}
                      onClick={handleDropdownToggle}
                    >
                      <span className={selectedAddress ? 'tw-text-gray-900' : 'tw-text-gray-500'}>
                        {selectedAddress ? `${selectedAddress.name} - $${selectedAddress.checkAmount}` : 'Select an option'}
                      </span>
                      <svg
                        className={`tw-w-5 tw-h-5 tw-transform ${isAddressSelectorOpen ? 'tw-rotate-180' : 'tw-rotate-0'} tw-transition-transform`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {isAddressSelectorOpen && (
                      <ul className="tw-absolute tw-left-0 tw-w-full tw-border tw-bg-white tw-z-10 tw-mt-1 tw-rounded-md tw-shadow-lg">
                        {allAddressData.map((item, index) => (
                          <li
                            key={index}
                            className="tw-flex tw-justify-between tw-px-4 tw-py-2 tw-hover:bg-gray-100 tw-cursor-pointer"
                            onClick={() => handleOptionSelect(item)} // Store the full address object
                          >
                            <span className="tw-text-left">{item.name}</span>
                            <span className="tw-text-right">${item.checkAmount}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Display selected address details if an address is selected */}
                  {selectedAddress && (
                    <div className="tw-bg-gray-100 tw-mt-4 tw-p-4 tw-rounded-md tw-border">
                      <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Selected Address Details</h3>
                      <div className="tw-grid tw-gap-4">
                        <div>
                          <label className="tw-block tw-font-semibold">Selected Mail Description</label>
                          <input
                            type="text"
                            className="tw-p-2 tw-border tw-rounded tw-w-full"
                            value={selectedAddress.description}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="tw-block tw-font-semibold">Street 1</label>
                          <input
                            type="text"
                            className="tw-p-2 tw-border tw-rounded tw-w-full"
                            value={selectedAddress.street1}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="tw-block tw-font-semibold">Street 2</label>
                          <input
                            type="text"
                            className="tw-p-2 tw-border tw-rounded tw-w-full"
                            value={selectedAddress.street2}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="tw-block tw-font-semibold">City</label>
                          <input
                            type="text"
                            className="tw-p-2 tw-border tw-rounded tw-w-full"
                            value={selectedAddress.city}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="tw-block tw-font-semibold">State</label>
                          <input
                            type="text"
                            className="tw-p-2 tw-border tw-rounded tw-w-full"
                            value={selectedAddress.state}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="tw-block tw-font-semibold">Zipcode</label>
                          <input
                            type="text"
                            className="tw-p-2 tw-border tw-rounded tw-w-full"
                            value={selectedAddress.zipcode}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="tw-text-lg tw-font-semibold tw-p-2">Return Address</h3>
                  {renderAddressFields(returnAddressData, true)}
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
