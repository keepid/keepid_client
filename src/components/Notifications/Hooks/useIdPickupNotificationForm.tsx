import { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../../serverOverride';
import {
  buildPickupMessage,
  EMPTY_ORG_ADDRESS,
  formatIdLabel,
  isValidUSPhone,
  OrgAddress,
  toE164US,
} from '../pickupNotificationTemplate';

const MIN_LOADING_DURATION = 500;

export interface NotificationFormErrors {
  clientPhone?: string;
  message?: string;
}

const validateForm = (
  phone: string,
  message: string,
): NotificationFormErrors => {
  const errors: NotificationFormErrors = {};
  if (!phone.trim()) {
    errors.clientPhone = 'Phone number is required';
  } else if (!isValidUSPhone(phone)) {
    errors.clientPhone = 'Enter a valid phone number (e.g. 215-555-1234)';
  }
  if (!message.trim()) {
    errors.message = 'Message is required';
  }
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

  const [clientName, setClientName] = useState(initialClientName);
  const [clientPhone, setClientPhone] = useState(initialClientPhone);
  const [workerName, setWorkerName] = useState(initialWorkerName);
  const [message, setMessage] = useState('');

  const [orgAddress, setOrgAddress] = useState<OrgAddress>(EMPTY_ORG_ADDRESS);
  const [orgAddressLoaded, setOrgAddressLoaded] = useState(false);
  const [messageInitialized, setMessageInitialized] = useState(!initialIdCategory);

  const [errors, setErrors] = useState<NotificationFormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverError, setServerError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const needClientInfo = !initialClientName.trim() || !initialClientPhone.trim();
    const needWorkerName = !initialWorkerName.trim();
    if (!needClientInfo && !needWorkerName) return undefined;

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
        if (needClientInfo && clientUsername.trim()) {
          const data = await fetchUserInfo(clientUsername);
          if (data?.status === 'SUCCESS') {
            const fetchedName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
            const fetchedPhone = data.phone || '';
            setClientName((prev) => prev || fetchedName);
            setClientPhone((prev) => prev || fetchedPhone);
          }
        }
        if (needWorkerName && workerUsername.trim()) {
          const data = await fetchUserInfo(workerUsername);
          if (data?.status === 'SUCCESS') {
            const fetchedName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
            setWorkerName((prev) => prev || fetchedName);
          }
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          // Best-effort autofill
        }
      }
    };

    hydrate();
    return () => controller.abort();
  }, [clientUsername, workerUsername, initialClientName, initialClientPhone, initialWorkerName]);

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
        if (e?.name !== 'AbortError') {
          // Best-effort
        }
      } finally {
        if (!controller.signal.aborted) {
          setOrgAddressLoaded(true);
        }
      }
    };

    fetchOrgInfo();
    return () => controller.abort();
  }, [organizationName]);

  useEffect(() => {
    if (messageInitialized) return;
    if (!clientName) return;
    if (!orgAddressLoaded) return;

    setMessage(
      buildPickupMessage({
        clientName,
        workerName,
        idCategory: initialIdCategory,
        orgAddress,
      }),
    );
    setMessageInitialized(true);
  }, [clientName, workerName, orgAddress, orgAddressLoaded, initialIdCategory, messageInitialized]);

  const onPhoneChange = (value: string) => {
    setClientPhone(value);
    if (hasAttemptedSubmit) {
      setErrors(validateForm(value, message));
    }
  };

  const onMessageChange = (value: string) => {
    setMessage(value);
    if (hasAttemptedSubmit) {
      setErrors(validateForm(clientPhone, value));
    }
  };

  const onSubmit = async (): Promise<NotificationFormErrors> => {
    setHasAttemptedSubmit(true);
    setServerError('');
    const validationErrors = validateForm(clientPhone, message);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return validationErrors;
    }

    const startTime = Date.now();

    try {
      setIsLoading(true);
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

      const responseText = await res.text();
      let data: { status?: string; message?: string } = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {};
        }
      }
      const elapsed = Date.now() - startTime;
      await new Promise((resolve) => {
        setTimeout(resolve, Math.max(0, MIN_LOADING_DURATION - elapsed));
      });

      setIsLoading(false);
      if (res.ok && data.status === 'SUCCESS') {
        setMessage('');
        setHasAttemptedSubmit(false);
        alert.show('Notification sent successfully');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setServerError(
          data.message || `Failed to send notification (HTTP ${res.status}). Please try again.`,
        );
      }
    } catch {
      const elapsed = Date.now() - startTime;
      await new Promise((resolve) => {
        setTimeout(resolve, Math.max(0, MIN_LOADING_DURATION - elapsed));
      });
      setIsLoading(false);
      setServerError('Unable to reach notification service. Please check your connection and try again.');
    }

    return {};
  };

  return {
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
  };
}
