import { Dialog } from '@headlessui/react';
import React, { useContext, useEffect, useState } from 'react';

import { UserContext } from '../../App';
import getServerURL from '../../serverOverride';
import { LoadingButton } from '../BaseComponents/Button';

interface Props {
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

interface MailHistoryEntry {
  id: string;
  mailStatus: string;
  lobId: string;
  lobCreatedAt: number | null;
  expectedDeliveryDate: string | null;
  costCents: number;
  mailType: string;
  checkAmount: string;
  mailingAddressName: string;
  requesterUsername: string;
  trackingEvents: { type: string; name: string; time: number | null; location: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'tw-bg-gray-200 tw-text-gray-700',
  MAILED: 'tw-bg-blue-100 tw-text-blue-700',
  IN_TRANSIT: 'tw-bg-yellow-100 tw-text-yellow-700',
  DELIVERED: 'tw-bg-green-100 tw-text-green-700',
  FAILED: 'tw-bg-red-100 tw-text-red-700',
};

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
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null);
  const [metadataLocked, setMetadataLocked] = useState(false);
  const [mailHistory, setMailHistory] = useState<MailHistoryEntry[]>([]);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

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
    checkAmount: '',
  });

  const [showInputError, setShowInputError] = useState(false);

  useEffect(() => {
    const fetchReturnAddress = async () => {
      try {
        const response = await fetch(`${getServerURL()}/get-organization-info`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgName: organization }),
        });
        if (response.ok) {
          const orgInfo = await response.json();
          const addr = orgInfo.orgAddress || {};
          setReturnAddressData({
            index: '',
            nameForCheck: '',
            officeName: orgInfo.name || organization,
            street1: addr.addressLineOne || '',
            street2: '',
            city: addr.city || '',
            state: addr.state || '',
            zipcode: addr.zipCode || addr.zipcode || '',
            description: '',
            name: '',
            checkAmount: '',
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (organization) {
      fetchReturnAddress();
    }
  }, [organization]);

  const fetchMailInfo = async () => {
    try {
      const response = await fetch(`${getServerURL()}/get-application-mail-info`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: documentId }),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.mailDestinationName || data.mailDestinationOfficeName || data.mailDestinationStreet1) {
        setSelectedAddress({
          index: data.mailDestinationNameForCheck || 'DYNAMIC',
          nameForCheck: data.mailDestinationNameForCheck || '',
          officeName: data.mailDestinationOfficeName || '',
          street1: data.mailDestinationStreet1 || '',
          street2: data.mailDestinationStreet2 || '',
          city: data.mailDestinationCity || '',
          state: data.mailDestinationState || '',
          zipcode: data.mailDestinationZip || '',
          description: data.mailDestinationDescription || '',
          name: data.mailDestinationName || '',
          checkAmount: data.mailDestinationCheckAmount || '0',
        });
        setMetadataLocked(true);
      }
    } catch (err: any) {
      console.error('Error fetching mail info:', err.message);
    }
  };

  const fetchMailHistory = async () => {
    try {
      const response = await fetch(`${getServerURL()}/get-mail-history`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: documentId }),
      });
      if (!response.ok) return;
      const data = await response.json();
      setMailHistory(data);
    } catch (err: any) {
      console.error('Error fetching mail history:', err.message);
    }
  };

  const refreshStatus = async (mailId: string) => {
    setRefreshingId(mailId);
    try {
      const response = await fetch(`${getServerURL()}/refresh-mail-status`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailId }),
      });
      if (response.ok) {
        await fetchMailHistory();
      }
    } catch (err: any) {
      console.error('Error refreshing status:', err.message);
    } finally {
      setRefreshingId(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      setShowInputError(false);
      setMetadataLocked(false);
      setSelectedAddress(null);
      setMailHistory([]);
      (async () => {
        await Promise.all([fetchMailInfo(), fetchMailHistory()]);
      })();
    }
  }, [isVisible]);

  const handleCloseModal = () => {
    setIsVisible(false);
    setShowInputError(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>, isReturnAddress: boolean) => {
    const { name, value } = e.target;
    if (isReturnAddress) {
      setReturnAddressData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const alreadyMailed = mailHistory.some(
    (m) => m.mailStatus === 'MAILED' || m.mailStatus === 'DELIVERED' || m.mailStatus === 'IN_TRANSIT',
  );

  const mailForm = async () => {
    if (!selectedAddress) {
      setShowInputError(true);
      return;
    }
    const requiredFields: (keyof AddressData)[] = ['officeName', 'street1', 'city', 'state', 'zipcode'];
    const isReturnAddressValid = requiredFields.every((field) => returnAddressData[field] !== '');
    if (!isReturnAddressValid) {
      setShowInputError(true);
      return;
    }
    setShowInputError(false);

    try {
      const response = await fetch(`${getServerURL()}/submit-mail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: targetUser,
          fileId: documentId,
          mailDestination: selectedAddress,
          returnAddress: {
            name: returnAddressData.name || returnAddressData.officeName,
            officeName: returnAddressData.officeName,
            street1: returnAddressData.street1,
            street2: returnAddressData.street2,
            city: returnAddressData.city,
            state: returnAddressData.state,
            zipcode: returnAddressData.zipcode,
          },
        }),
      });
      const responseJSON = await response.json();
      if (responseJSON.status === 'MAIL_SUCCESS') {
        setIsVisible(false);
        setShowMailSuccess(true);
      } else {
        setIsVisible(false);
        const msg = responseJSON.message || 'Unknown error';
        alert.show(`Mail failed: ${msg}`);
      }
    } catch (error: any) {
      setIsVisible(false);
      alert.show(`Failed to submit: ${error.message || error}`);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleDateString();
  };

  const renderMailHistory = () => {
    if (mailHistory.length === 0) return null;
    return (
      <div className="tw-mb-4">
        <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Mail History</h3>
        {alreadyMailed && (
          <div className="tw-bg-yellow-50 tw-border tw-border-yellow-300 tw-rounded tw-p-3 tw-mb-3 tw-text-sm tw-text-yellow-800">
            This document has already been mailed.
          </div>
        )}
        <div className="tw-space-y-2">
          {mailHistory.map((entry) => {
            const latestEvent = entry.trackingEvents?.length > 0
              ? entry.trackingEvents[entry.trackingEvents.length - 1]
              : null;
            return (
              <div
                key={entry.id}
                className="tw-border tw-rounded tw-p-3 tw-bg-gray-50"
              >
                <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className={`tw-px-2 tw-py-0.5 tw-rounded tw-text-xs tw-font-medium ${STATUS_COLORS[entry.mailStatus] || 'tw-bg-gray-200'}`}>
                      {entry.mailStatus}
                    </span>
                    <span className="tw-text-sm tw-text-gray-600">
                      {entry.mailingAddressName}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="tw-text-xs tw-text-blue-600 hover:tw-underline"
                    disabled={refreshingId === entry.id}
                    onClick={() => refreshStatus(entry.id)}
                  >
                    {refreshingId === entry.id ? 'Refreshing...' : 'Refresh Status'}
                  </button>
                </div>
                <div className="tw-text-xs tw-text-gray-500 tw-flex tw-gap-4">
                  <span>Sent: {formatDate(entry.lobCreatedAt)}</span>
                  {entry.expectedDeliveryDate && (
                    <span>Expected: {entry.expectedDeliveryDate}</span>
                  )}
                  <span>Cost: ${(entry.costCents / 100).toFixed(2)}</span>
                  {entry.checkAmount && entry.checkAmount !== '0' && (
                    <span>Check: ${entry.checkAmount}</span>
                  )}
                </div>
                {latestEvent && (
                  <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                    Latest: {latestEvent.type || latestEvent.name}
                    {latestEvent.location ? ` — ${latestEvent.location}` : ''}
                    {latestEvent.time ? ` — ${formatDate(latestEvent.time)}` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
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
          className={`tw-w-full tw-p-2 tw-border ${showInputError && data.officeName === '' ? 'tw-border-red-500' : 'tw-border-gray-300'} tw-rounded`}
          placeholder="Enter office name"
          readOnly={!isReturnAddress}
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
          readOnly={!isReturnAddress}
        />
        <input
          type="text"
          name="street2"
          value={data.street2}
          onChange={(e) => handleAddressChange(e, isReturnAddress)}
          className="tw-w-full tw-p-2 tw-border tw-border-gray-300 tw-rounded"
          placeholder="Apt, suite, building, floor, etc. (optional)"
          readOnly={!isReturnAddress}
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
            readOnly={!isReturnAddress}
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
            readOnly={!isReturnAddress}
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
            readOnly={!isReturnAddress}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Dialog open={isVisible} onClose={() => setIsVisible(false)} className="tw-relative tw-z-[100]">
        <div className="tw-fixed tw-inset-0 tw-bg-black/30 tw-z-[100]" aria-hidden="true" />
        <div className="tw-fixed tw-inset-0 tw-z-[101] tw-flex tw-items-center tw-justify-center tw-p-4">
          <Dialog.Panel className="tw-max-h-[86vh] tw-w-[50rem] tw-flex tw-flex-col tw-bg-white tw-rounded-md tw-shadow-lg tw-relative tw-overflow-hidden">
            <div className="tw-overflow-y-auto tw-flex-grow">
              <div className="tw-p-4">
                {renderMailHistory()}

                <p className="tw-text-left tw-text-2xl tw-font-semibold">
                  {metadataLocked ? 'Mail Destination (from application)' : 'Please Select your target Mail Address'}
                </p>

                {metadataLocked && selectedAddress ? (
                  <div className="tw-bg-blue-50 tw-mt-2 tw-p-4 tw-rounded-md tw-border tw-border-blue-200">
                    <h3 className="tw-text-lg tw-font-semibold tw-mb-2">
                      {selectedAddress.name} — ${selectedAddress.checkAmount}
                    </h3>
                    <div className="tw-text-sm tw-text-gray-700 tw-space-y-1">
                      {selectedAddress.description && <p>{selectedAddress.description}</p>}
                      <p>{selectedAddress.street1} {selectedAddress.street2}</p>
                      <p>{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipcode}</p>
                    </div>
                  </div>
                ) : (
                  <div className="tw-bg-gray-50 tw-mt-2 tw-p-4 tw-rounded-md tw-border tw-border-gray-200 tw-text-center tw-text-gray-500">
                    No Mail Destination is configured for this application. Please update the application in the Dev Portal to enable mailing.
                  </div>
                )}
              </div>

              <div>
                <h3 className="tw-text-lg tw-font-semibold tw-p-2">Return Address</h3>
                {renderAddressFields(returnAddressData, true)}
              </div>

              {showInputError && (
                <p className="tw-text-red-500 tw-text-sm tw-px-4">
                  Please fill in all required address fields.
                </p>
              )}

              <div className="tw-m-8 tw-mt-10 tw-flex tw-justify-between">
                <button
                  type="button"
                  className="tw-inline-flex tw-justify-center tw-rounded-md tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 hover:tw-bg-gray-50"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <LoadingButton onClick={mailForm}>Yes, mail</LoadingButton>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

interface ConfirmationProps {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
}

export const MailConfirmation: React.FC<ConfirmationProps> = ({ isVisible, setIsVisible }) => (
  <div>
    <Dialog open={isVisible} onClose={() => setIsVisible(false)} className="tw-relative tw-z-[100]">
      <div className="tw-fixed tw-inset-0 tw-bg-black/30 tw-z-[100]" aria-hidden="true" />
      <div className="tw-fixed tw-inset-0 tw-z-[101] tw-flex tw-items-center tw-justify-center tw-p-4">
        <Dialog.Panel className="tw-flex tw-flex-col tw-items-center tw-m-20 tw-w-[30rem] tw-rounded-md tw-bg-white tw-p-1 tw-shadow-md">
          <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-green-600 tw-mt-8 tw-mb-2 tw-flex tw-items-center tw-justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="tw-w-8 tw-h-8 tw-text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <Dialog.Title className="tw-font-body tw-text-lg tw-font-semibold">Sent</Dialog.Title>
          <p className="tw-font-body tw-text-sm tw-text-gray-600 tw-pt-2">
            Team Keep has received your application!
          </p>
          <div className="tw-flex tw-flex-row tw-w-full tw-justify-end tw-p-4 tw-pt-6">
            <button type="button" className="tw-bg-twprimary tw-border-0 tw-text-white tw-px-3 tw-py-1 tw-rounded-md hover:tw-bg-blue-800" onClick={() => setIsVisible(false)}>Done</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  </div>
);
