import { useEffect, useRef, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../../serverOverride';
import {
  buildClientDocumentsUrl,
  buildPickupEmailBody,
  buildPickupEmailSubject,
  buildPickupMessage,
  EMPTY_ORG_ADDRESS,
  formatIdLabel,
  isValidEmail,
  isValidUSPhone,
  OrgAddress,
  toE164US,
} from '../pickupNotificationTemplate';

const MIN_LOADING_DURATION = 500;

export interface SmsFormErrors {
  clientPhone?: string;
  message?: string;
}

export interface EmailFormErrors {
  clientEmail?: string;
  emailSubject?: string;
  emailBody?: string;
}

const validateSms = (phone: string, message: string): SmsFormErrors => {
  const errors: SmsFormErrors = {};
  if (!phone.trim()) {
    errors.clientPhone = 'Phone number is required';
  } else if (!isValidUSPhone(phone)) {
    errors.clientPhone = 'Enter a valid phone number (e.g. 215-555-1234)';
  }
  if (!message.trim()) errors.message = 'Message is required';
  return errors;
};

const validateEmail = (email: string, subject: string, body: string): EmailFormErrors => {
  const errors: EmailFormErrors = {};
  if (!email.trim()) {
    errors.clientEmail = 'Email address is required';
  } else if (!isValidEmail(email)) {
    errors.clientEmail = 'Enter a valid email address';
  }
  if (!subject.trim()) errors.emailSubject = 'Subject is required';
  if (!body.trim()) errors.emailBody = 'Body is required';
  return errors;
};

export default function useNotificationForm(
  clientUsername: string,
  workerUsername: string,
  organizationName: string,
  initialIdCategory: string | undefined,
  initialWorkerName: string,
  initialClientName: string,
  initialClientPhone: string,
) {
  const alert = useAlert();

  // ── Shared display state ──────────────────────────────────────────────────
  const [clientName, setClientName] = useState(initialClientName);
  const [workerName, setWorkerName] = useState(initialWorkerName);
  const [orgAddress, setOrgAddress] = useState<OrgAddress>(EMPTY_ORG_ADDRESS);
  const [orgAddressLoaded, setOrgAddressLoaded] = useState(false);

  // ── SMS section ───────────────────────────────────────────────────────────
  const [clientPhone, setClientPhone] = useState(initialClientPhone);
  const [message, setMessage] = useState('');
  const [smsErrors, setSmsErrors] = useState<SmsFormErrors>({});
  const [smsAttempted, setSmsAttempted] = useState(false);
  const [smsServerError, setSmsServerError] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const smsMessageInitialized = useRef(!initialIdCategory);

  // ── Email section ─────────────────────────────────────────────────────────
  const [clientEmail, setClientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailErrors, setEmailErrors] = useState<EmailFormErrors>({});
  const [emailAttempted, setEmailAttempted] = useState(false);
  const [emailServerError, setEmailServerError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  // Mirror SMS: only autofill when the form was opened with a specific document
  // context. Without initialIdCategory (plain Notification Center), stay empty.
  const emailInitialized = useRef(!initialIdCategory);

  // ── Shared notification history refresh ───────────────────────────────────
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Hydrate user info (name, phone, email) ────────────────────────────────
  useEffect(() => {
    if (!clientUsername.trim() && !workerUsername.trim()) return undefined;
    const controller = new AbortController();

    const fetchUserInfo = async (uname: string) => {
      const res = await fetch(`${getServerURL()}/get-user-info`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uname }),
        signal: controller.signal,
      });
      return res.json();
    };

    const hydrate = async () => {
      try {
        if (clientUsername.trim()) {
          const data = await fetchUserInfo(clientUsername);
          if (data?.status === 'SUCCESS') {
            const fetchedName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
            setClientName((prev) => prev || fetchedName);
            setClientPhone((prev) => prev || (data.phone || ''));
            setClientEmail((prev) => prev || (data.email || ''));
          }
        }
        if (workerUsername.trim()) {
          const data = await fetchUserInfo(workerUsername);
          if (data?.status === 'SUCCESS') {
            const fetchedName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
            setWorkerName((prev) => prev || fetchedName);
          }
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') { /* best-effort */ }
      }
    };

    hydrate();
    return () => controller.abort();
  }, [clientUsername, workerUsername, initialClientName, initialClientPhone, initialWorkerName]);

  // ── Hydrate org address ───────────────────────────────────────────────────
  useEffect(() => {
    if (!organizationName.trim()) {
      setOrgAddressLoaded(true);
      return undefined;
    }
    const controller = new AbortController();

    const fetchOrgInfo = async () => {
      try {
        const res = await fetch(`${getServerURL()}/get-organization-info`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgName: organizationName }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data?.status === 'SUCCESS' && data?.orgAddress) {
          const { line1 = '', line2 = '', city = '', state = '', zip = '' } = data.orgAddress;
          setOrgAddress({
            street: [line1, line2].filter(Boolean).join(', '),
            city,
            state,
            zip,
          });
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') { /* best-effort */ }
      } finally {
        if (!controller.signal.aborted) setOrgAddressLoaded(true);
      }
    };

    fetchOrgInfo();
    return () => controller.abort();
  }, [organizationName]);

  // ── Autofill SMS message once name + address are ready ────────────────────
  useEffect(() => {
    if (smsMessageInitialized.current) return;
    if (!clientName || !orgAddressLoaded) return;
    setMessage(
      buildPickupMessage({
        clientName,
        workerName,
        idCategory: initialIdCategory,
        orgAddress,
      }),
    );
    smsMessageInitialized.current = true;
  }, [clientName, workerName, orgAddress, orgAddressLoaded, initialIdCategory]);

  // ── Autofill email subject + body once name + address are ready ───────────
  useEffect(() => {
    if (emailInitialized.current) return;
    if (!clientName || !orgAddressLoaded) return;
    const documentLink = buildClientDocumentsUrl();
    setEmailSubject(buildPickupEmailSubject(initialIdCategory));
    const { text } = buildPickupEmailBody({
      clientName,
      idCategory: initialIdCategory,
      organizationName,
      orgAddress,
      clientEmail,
      documentLink,
    });
    setEmailBody(text);
    emailInitialized.current = true;
  // clientEmail intentionally excluded: we don't want re-editing the email
  // field to wipe the body once the user has started typing.
  }, [clientName, orgAddress, orgAddressLoaded, initialIdCategory, organizationName]);

  // ── SMS handlers ──────────────────────────────────────────────────────────
  const onPhoneChange = (value: string) => {
    setClientPhone(value);
    if (smsAttempted) setSmsErrors(validateSms(value, message));
  };

  const onMessageChange = (value: string) => {
    setMessage(value);
    if (smsAttempted) setSmsErrors(validateSms(clientPhone, value));
  };

  const onSubmitSms = async (): Promise<SmsFormErrors> => {
    setSmsAttempted(true);
    setSmsServerError('');
    const errors = validateSms(clientPhone, message);
    setSmsErrors(errors);
    if (Object.keys(errors).length > 0) return errors;

    const start = Date.now();
    try {
      setSmsLoading(true);
      const res = await fetch(`${getServerURL()}/notify-id-pickup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerUsername,
          clientUsername,
          idToPickup: initialIdCategory ? formatIdLabel(initialIdCategory) : 'General',
          clientPhoneNumber: toE164US(clientPhone),
          message,
        }),
      });
      const elapsed = Date.now() - start;
      await new Promise((r) => { setTimeout(r, Math.max(0, MIN_LOADING_DURATION - elapsed)); });
      setSmsLoading(false);

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.status === 'SUCCESS') {
        setSmsAttempted(false);
        setSmsErrors({});
        alert.show('Text message sent successfully');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setSmsServerError(data?.message || `Failed to send text (HTTP ${res.status}). Please try again.`);
      }
    } catch {
      const elapsed = Date.now() - start;
      await new Promise((r) => { setTimeout(r, Math.max(0, MIN_LOADING_DURATION - elapsed)); });
      setSmsLoading(false);
      setSmsServerError('Unable to reach notification service. Please check your connection and try again.');
    }
    return {};
  };

  // ── Email handlers ────────────────────────────────────────────────────────
  const onEmailChange = (value: string) => {
    setClientEmail(value);
    if (emailAttempted) setEmailErrors(validateEmail(value, emailSubject, emailBody));
  };

  const onEmailSubjectChange = (value: string) => {
    setEmailSubject(value);
    if (emailAttempted) setEmailErrors(validateEmail(clientEmail, value, emailBody));
  };

  const onEmailBodyChange = (value: string) => {
    setEmailBody(value);
    if (emailAttempted) setEmailErrors(validateEmail(clientEmail, emailSubject, value));
  };

  const onSubmitEmail = async (): Promise<EmailFormErrors> => {
    setEmailAttempted(true);
    setEmailServerError('');
    const errors = validateEmail(clientEmail, emailSubject, emailBody);
    setEmailErrors(errors);
    if (Object.keys(errors).length > 0) return errors;

    const start = Date.now();
    try {
      setEmailLoading(true);
      const res = await fetch(`${getServerURL()}/notify-id-pickup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerUsername,
          clientUsername,
          idToPickup: initialIdCategory ? formatIdLabel(initialIdCategory) : 'General',
          clientEmail: clientEmail.trim(),
          emailSubject,
          emailBody,
        }),
      });
      const elapsed = Date.now() - start;
      await new Promise((r) => { setTimeout(r, Math.max(0, MIN_LOADING_DURATION - elapsed)); });
      setEmailLoading(false);

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.status === 'SUCCESS') {
        setEmailAttempted(false);
        setEmailErrors({});
        alert.show('Email sent successfully');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setEmailServerError(data?.message || `Failed to send email (HTTP ${res.status}). Please try again.`);
      }
    } catch {
      const elapsed = Date.now() - start;
      await new Promise((r) => { setTimeout(r, Math.max(0, MIN_LOADING_DURATION - elapsed)); });
      setEmailLoading(false);
      setEmailServerError('Unable to reach notification service. Please check your connection and try again.');
    }
    return {};
  };

  return {
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
  };
}
