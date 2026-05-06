import React from 'react';
import { useHistory } from 'react-router-dom';

import useNotificationForm, {
  EmailFormErrors,
  SmsFormErrors,
} from './Hooks/useIdPickupNotificationForm';
import NotificationActivity from './NotificationActivity';

const INPUT_CLASS =
  'tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-px-3 tw-shadow-sm tw-ring-1 tw-ring-inset focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600';

const ringFor = (hasError: boolean) =>
  hasError ? 'tw-ring-red-500' : 'tw-ring-gray-300';

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
    // SMS
    clientPhone,
    message,
    smsErrors,
    smsAttempted,
    smsServerError,
    smsLoading,
    onPhoneChange,
    onMessageChange,
    onSubmitSms,
    // Email
    clientEmail,
    emailSubject,
    emailBody,
    emailErrors,
    emailAttempted,
    emailServerError,
    emailLoading,
    onEmailChange,
    onEmailSubjectChange,
    onEmailBodyChange,
    onSubmitEmail,
    // Shared
    refreshTrigger,
  } = useNotificationForm(
    clientUsername,
    workerUsername,
    organizationName,
    initialIdCategory,
    initialWorkerName,
    initialClientName,
    initialClientPhone,
  );

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = await onSubmitSms();
    if (errs.clientPhone) {
      document.getElementById('sms-client-phone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errs.message) {
      document.getElementById('sms-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = await onSubmitEmail();
    if (errs.clientEmail) {
      document.getElementById('email-address')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errs.emailSubject) {
      document.getElementById('email-subject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errs.emailBody) {
      document.getElementById('email-body')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderSmsError = (field: keyof SmsFormErrors) =>
    smsAttempted && smsErrors[field] ? (
      <p className="tw-mt-1 tw-text-sm tw-text-red-500">{smsErrors[field]}</p>
    ) : null;

  const renderEmailError = (field: keyof EmailFormErrors) =>
    emailAttempted && emailErrors[field] ? (
      <p className="tw-mt-1 tw-text-sm tw-text-red-500">{emailErrors[field]}</p>
    ) : null;

  const smsErrorCount = Object.keys(smsErrors).length;
  const emailErrorCount = Object.keys(emailErrors).length;

  return (
    <div className="container">
      <h1 className="tw-text-3xl tw-font-bold tw-text-gray-800 m-3">
        Notification Center for {clientName || '...'}
      </h1>

      <div className="row">
        {/* ── Left column: two send forms ────────────────────────────── */}
        <div className="col-md-6 col-12 mt-2 tw-flex tw-flex-col tw-gap-6">

          {/* ── Text message section ──────────────────────────────────── */}
          <div>
            <h2 className="tw-text-xl tw-font-semibold tw-text-gray-700 tw-mb-3">
              Text Message
            </h2>
            <form onSubmit={handleSmsSubmit} noValidate>
              <div
                className="tw-rounded-md"
                style={{ borderColor: '#D1D5DB', borderWidth: 1, borderStyle: 'solid' }}
              >
                {(smsAttempted && smsErrorCount > 0) || smsServerError ? (
                  <div className="tw-bg-red-50 tw-border-b tw-border-red-400 tw-px-5 tw-py-3 tw-rounded-t-md">
                    <p className="tw-text-sm tw-text-red-700 tw-mb-0 tw-font-medium">
                      {smsServerError || `Please fix ${smsErrorCount} ${smsErrorCount === 1 ? 'error' : 'errors'} below.`}
                    </p>
                  </div>
                ) : null}

                <div className="tw-p-5">
                  <label
                    htmlFor="sms-client-phone"
                    className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="sms-client-phone"
                    placeholder="e.g. 215-555-1234"
                    value={clientPhone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    className={`${INPUT_CLASS} ${ringFor(smsAttempted && !!smsErrors.clientPhone)}`}
                  />
                  {renderSmsError('clientPhone')}
                </div>

                <div className="tw-px-5 tw-pb-5">
                  <label
                    htmlFor="sms-message"
                    className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="sms-message"
                    rows={6}
                    placeholder="Type your message to the client..."
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    className={`${INPUT_CLASS} tw-resize-none ${ringFor(smsAttempted && !!smsErrors.message)}`}
                  />
                  {renderSmsError('message')}
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
                  className={`tw-rounded-md tw-bg-twprimary tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-blue-700 ld-ext-right ${smsLoading ? 'running' : ''}`}
                >
                  Send Text
                  <div className="ld ld-ring ld-spin" />
                </button>
              </div>
            </form>
          </div>

          {/* ── Email section ─────────────────────────────────────────── */}
          <div>
            <h2 className="tw-text-xl tw-font-semibold tw-text-gray-700 tw-mb-3">
              Email
            </h2>
            <form onSubmit={handleEmailSubmit} noValidate>
              <div
                className="tw-rounded-md"
                style={{ borderColor: '#D1D5DB', borderWidth: 1, borderStyle: 'solid' }}
              >
                {(emailAttempted && emailErrorCount > 0) || emailServerError ? (
                  <div className="tw-bg-red-50 tw-border-b tw-border-red-400 tw-px-5 tw-py-3 tw-rounded-t-md">
                    <p className="tw-text-sm tw-text-red-700 tw-mb-0 tw-font-medium">
                      {emailServerError || `Please fix ${emailErrorCount} ${emailErrorCount === 1 ? 'error' : 'errors'} below.`}
                    </p>
                  </div>
                ) : null}

                <div className="tw-p-5">
                  <label
                    htmlFor="email-address"
                    className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email-address"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className={`${INPUT_CLASS} ${ringFor(emailAttempted && !!emailErrors.clientEmail)}`}
                  />
                  {renderEmailError('clientEmail')}
                </div>

                <div className="tw-px-5 tw-pb-4">
                  <label
                    htmlFor="email-subject"
                    className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="email-subject"
                    placeholder="Subject line"
                    value={emailSubject}
                    onChange={(e) => onEmailSubjectChange(e.target.value)}
                    className={`${INPUT_CLASS} ${ringFor(emailAttempted && !!emailErrors.emailSubject)}`}
                  />
                  {renderEmailError('emailSubject')}
                </div>

                <div className="tw-px-5 tw-pb-5">
                  <label
                    htmlFor="email-body"
                    className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1"
                  >
                    Body
                  </label>
                  <textarea
                    id="email-body"
                    rows={10}
                    placeholder="Email body..."
                    value={emailBody}
                    onChange={(e) => onEmailBodyChange(e.target.value)}
                    className={`${INPUT_CLASS} tw-resize-none ${ringFor(emailAttempted && !!emailErrors.emailBody)}`}
                  />
                  {renderEmailError('emailBody')}
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
                  className={`tw-rounded-md tw-bg-twprimary tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-blue-700 ld-ext-right ${emailLoading ? 'running' : ''}`}
                >
                  Send Email
                  <div className="ld ld-ring ld-spin" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Right column: notification history ─────────────────────── */}
        <div className="col-md-6 col-12 mt-2">
          <div>
            <div
              className="rounded-top"
              style={{ borderColor: '#D1D5DB', borderWidth: 1, borderStyle: 'solid' }}
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
                maxHeight: '52rem',
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
