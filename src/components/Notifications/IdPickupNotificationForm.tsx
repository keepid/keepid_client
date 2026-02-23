import React from 'react';
import { useHistory } from 'react-router-dom';

import useIdPickupNotificationForm, {
  ID_PICKUP_OPTIONS,
  IdPickupFormErrors,
} from './Hooks/useIdPickupNotificationForm';
import NotificationActivity from './NotificationActivity';

const BASE_INPUT_CLASS =
  'tw-col-span-2 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-px-3 tw-shadow-sm tw-ring-1 tw-ring-inset focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600';

const FIELD_ID_MAP: Record<string, string> = {
  workerName: 'worker-name',
  clientName: 'client-name',
  clientPhone: 'client-phone',
  idToPickup: 'id-to-pickup',
  customIdToPickup: 'custom-id',
  pickupStreetAddress: 'street-address',
  pickupCity: 'city',
  pickupState: 'state',
  pickupZipCode: 'zip-code',
  pickupHours: 'pickup-hours',
};

export default function IdPickupNotificationForm({
  clientUsername,
  workerUsername,
  initialWorkerName,
  initialClientName,
  initialClientPhone,
}: {
  clientUsername: string;
  workerUsername: string;
  initialWorkerName: string;
  initialClientName: string;
  initialClientPhone: string;
}) {
  const history = useHistory();
  const {
    formValues,
    errors,
    hasAttemptedSubmit,
    serverError,
    refreshTrigger,
    isLoading,
    onChange,
    onSubmit,
    getMessagePreview,
  } = useIdPickupNotificationForm(clientUsername, workerUsername, initialWorkerName, initialClientName, initialClientPhone);

  const ringClass = (fieldName: keyof IdPickupFormErrors) =>
    hasAttemptedSubmit && errors[fieldName]
      ? 'tw-ring-red-500'
      : 'tw-ring-gray-300';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = await onSubmit();
    const firstErrorKey = Object.keys(validationErrors)[0];
    if (firstErrorKey) {
      const elementId = FIELD_ID_MAP[firstErrorKey];
      if (elementId) {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleGoToDashboard = () => {
    history.push('/home');
  };

  const renderError = (fieldName: keyof IdPickupFormErrors) =>
    hasAttemptedSubmit && errors[fieldName] ? (
      <p className="tw-mt-1 tw-text-sm tw-text-red-500">{errors[fieldName]}</p>
    ) : null;

  return (
    <div className="container">
        <h1 className="tw-text-3xl tw-font-bold tw-text-gray-800 m-3">
          ID Pickup Notifier
        </h1>

        <div className="row">
          <div className="col-md-6 col-12 mt-2">
              <form
                onSubmit={handleFormSubmit}
                noValidate
              >
                <div
                  className="rounded"
                  style={{
                    borderColor: '#D1D5DB',
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                >
                  <div className="tw-rounded-t-md tw-border tw-border-gray-200 tw-bg-gray-100 tw-p-5">
                    <h2 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-2">
                      Message Preview
                    </h2>
                    <div className="tw-rounded-md tw-bg-white tw-border tw-border-gray-200 tw-p-4 tw-text-sm tw-text-gray-700 tw-leading-relaxed">
                      {getMessagePreview()}
                    </div>
                  </div>
                  {(hasAttemptedSubmit && Object.keys(errors).length > 0) || serverError ? (
                    <div className="tw-bg-red-50 tw-border-b tw-border-red-400 tw-px-5 tw-py-3">
                      <p className="tw-text-sm tw-text-red-700 tw-mb-0 tw-font-medium">
                        {serverError || `Please fix ${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? 'error' : 'errors'} below before sending.`}
                      </p>
                    </div>
                  ) : null}

                  <ul
                    className="tw-list-none tw-p-0 tw-mb-0"
                    style={{
                      maxHeight: '23rem',
                      overflow: 'auto',
                    }}
                  >
                    <li>
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="worker-name"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Worker Name
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="worker-name"
                            value={formValues.workerName as string}
                            onChange={(e) => onChange('workerName', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('workerName')}`}
                          />
                          {renderError('workerName')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="client-name"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Client Name
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="client-name"
                            value={formValues.clientName as string}
                            onChange={(e) => onChange('clientName', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('clientName')}`}
                          />
                          {renderError('clientName')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="client-phone"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Client Phone
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="client-phone"
                            placeholder="e.g. 215-555-1234"
                            value={formValues.clientPhone as string}
                            onChange={(e) => onChange('clientPhone', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('clientPhone')}`}
                          />
                          {renderError('clientPhone')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="id-to-pickup"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          ID to Pickup
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <select
                            id="id-to-pickup"
                            value={formValues.idToPickup as string}
                            onChange={(e) => onChange('idToPickup', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('idToPickup')}`}
                          >
                            <option value="">Select an ID type...</option>
                            {ID_PICKUP_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          {renderError('idToPickup')}
                        </div>
                      </div>
                    </li>

                    {formValues.idToPickup === 'Other' && (
                      <li>
                        <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                          <label
                            htmlFor="custom-id"
                            className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                          >
                            Specify ID Type
                          </label>
                          <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                            <input
                              type="text"
                              id="custom-id"
                              placeholder="Enter the type of ID"
                              value={formValues.customIdToPickup as string}
                              onChange={(e) => onChange('customIdToPickup', e.target.value)}
                              className={`${BASE_INPUT_CLASS} ${ringClass('customIdToPickup')}`}
                            />
                            {renderError('customIdToPickup')}
                          </div>
                        </div>
                      </li>
                    )}

                    <li>
                      <div className="tw-py-4 tw-pl-5">
                        <h2 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-0">Pickup Address</h2>
                      </div>
                    </li>

                    <li>
                      <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="street-address"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Street Address
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="street-address"
                            value={formValues.pickupStreetAddress as string}
                            onChange={(e) => onChange('pickupStreetAddress', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('pickupStreetAddress')}`}
                          />
                          {renderError('pickupStreetAddress')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="city"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          City
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="city"
                            value={formValues.pickupCity as string}
                            onChange={(e) => onChange('pickupCity', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('pickupCity')}`}
                          />
                          {renderError('pickupCity')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="state"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          State
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="state"
                            placeholder="e.g. PA"
                            maxLength={2}
                            value={formValues.pickupState as string}
                            onChange={(e) => onChange('pickupState', e.target.value.toUpperCase())}
                            className={`${BASE_INPUT_CLASS} ${ringClass('pickupState')}`}
                          />
                          {renderError('pickupState')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="zip-code"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          ZIP Code
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="zip-code"
                            placeholder="e.g. 19104"
                            value={formValues.pickupZipCode as string}
                            onChange={(e) => onChange('pickupZipCode', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('pickupZipCode')}`}
                          />
                          {renderError('pickupZipCode')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="pickup-hours"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Pickup Hours
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <input
                            type="text"
                            id="pickup-hours"
                            placeholder="e.g. Mon-Fri 9am-5pm"
                            value={formValues.pickupHours as string}
                            onChange={(e) => onChange('pickupHours', e.target.value)}
                            className={`${BASE_INPUT_CLASS} ${ringClass('pickupHours')}`}
                          />
                          {renderError('pickupHours')}
                        </div>
                      </div>
                    </li>

                    <li>
                      <div className="tw-rounded-b-md tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                        <label
                          htmlFor="additional-comments"
                          className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                        >
                          Additional Comments
                        </label>
                        <div className="tw-col-span-2 tw-px-5 sm:tw-px-0">
                          <textarea
                            id="additional-comments"
                            value={formValues.additionalComments as string}
                            onChange={(e) => onChange('additionalComments', e.target.value)}
                            rows={3}
                            className={`${BASE_INPUT_CLASS} tw-resize-none`}
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="tw-flex tw-justify-end tw-gap-3 tw-mt-3">
                  <button
                    type="button"
                    onClick={handleGoToDashboard}
                    className="tw-rounded-md tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border tw-border-gray-300 hover:tw-bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`tw-rounded-md tw-bg-twprimary tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-blue-700 ld-ext-right ${isLoading ? 'running' : ''}`}
                  >
                    Send Notification
                    <div className="ld ld-ring ld-spin" />
                  </button>
                </div>
              </form>
          </div>
          <div className="col-md-6 col-12 mt-2">
            <div>
              <div
                className="rounded-top"
                style={{
                  borderColor: '#D1D5DB',
                  borderWidth: 1,
                  borderStyle: 'solid',
                }}
              >
                <p className="tw-text-center tw-text-2xl font-weight-bold mt-3">
                  Notification Activity
                </p>
              </div>
              <div
                className="rounded-bottom border-top-0 text-center container"
                style={{
                  borderColor: '#D1D5DB',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderTop: 0,
                  maxHeight: '33rem',
                  overflow: 'scroll',
                }}
              >
                <NotificationActivity clientUsername={clientUsername} refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
