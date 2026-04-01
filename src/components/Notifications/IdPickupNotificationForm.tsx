import React from 'react';
import { useHistory } from 'react-router-dom';

import useNotificationForm, {
  NotificationFormErrors,
} from './Hooks/useIdPickupNotificationForm';
import NotificationActivity from './NotificationActivity';

const INPUT_CLASS =
  'tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-px-3 tw-shadow-sm tw-ring-1 tw-ring-inset focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600';

export default function IdPickupNotificationForm({
  clientUsername,
  workerUsername,
  organizationName,
  initialIdCategory,
  initialWorkerName,
  initialClientName,
  initialClientPhone,
}: {
  clientUsername: string;
  workerUsername: string;
  organizationName: string;
  initialIdCategory?: string;
  initialWorkerName: string;
  initialClientName: string;
  initialClientPhone: string;
}) {
  const history = useHistory();
  const {
    clientName,
    clientPhone,
    message,
    errors,
    hasAttemptedSubmit,
    serverError,
    refreshTrigger,
    isLoading,
    onPhoneChange,
    onMessageChange,
    onSubmit,
  } = useNotificationForm(
    clientUsername,
    workerUsername,
    organizationName,
    initialIdCategory,
    initialWorkerName,
    initialClientName,
    initialClientPhone,
  );

  const ringClass = (field: keyof NotificationFormErrors) =>
    hasAttemptedSubmit && errors[field]
      ? 'tw-ring-red-500'
      : 'tw-ring-gray-300';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = await onSubmit();
    if (validationErrors.clientPhone) {
      document.getElementById('client-phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (validationErrors.message) {
      document.getElementById('notification-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderError = (field: keyof NotificationFormErrors) =>
    hasAttemptedSubmit && errors[field] ? (
      <p className="tw-mt-1 tw-text-sm tw-text-red-500">{errors[field]}</p>
    ) : null;

  return (
    <div className="container">
      <h1 className="tw-text-3xl tw-font-bold tw-text-gray-800 m-3">
        Notification Center for {clientName || '...'}
      </h1>

      <div className="row">
        <div className="col-md-6 col-12 mt-2">
          <form onSubmit={handleFormSubmit} noValidate>
            <div
              className="tw-rounded-md"
              style={{
                borderColor: '#D1D5DB',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              {(hasAttemptedSubmit && Object.keys(errors).length > 0) || serverError ? (
                <div className="tw-bg-red-50 tw-border-b tw-border-red-400 tw-px-5 tw-py-3 tw-rounded-t-md">
                  <p className="tw-text-sm tw-text-red-700 tw-mb-0 tw-font-medium">
                    {serverError || `Please fix ${Object.keys(errors).length} ${Object.keys(errors).length === 1 ? 'error' : 'errors'} below before sending.`}
                  </p>
                </div>
              ) : null}

              <div className="tw-p-5">
                <label
                  htmlFor="client-phone"
                  className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                >
                  Client Phone
                </label>
                <input
                  type="text"
                  id="client-phone"
                  placeholder="e.g. 215-555-1234"
                  value={clientPhone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  className={`${INPUT_CLASS} ${ringClass('clientPhone')}`}
                />
                {renderError('clientPhone')}
              </div>

              <div className="tw-px-5 tw-pb-5">
                <label
                  htmlFor="notification-message"
                  className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                >
                  Message
                </label>
                <textarea
                  id="notification-message"
                  rows={8}
                  placeholder="Type your message to the client..."
                  value={message}
                  onChange={(e) => onMessageChange(e.target.value)}
                  className={`${INPUT_CLASS} tw-resize-none ${ringClass('message')}`}
                />
                {renderError('message')}
              </div>
            </div>

            <div className="tw-flex tw-justify-end tw-gap-3 tw-mt-3">
              <button
                type="button"
                onClick={() => history.push('/home')}
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
                Notification History
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
