import { useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../../serverOverride';

const PHONE_REGEX = /^\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;
const STATE_REGEX = /^[A-Z]{2}$/;
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;
const MIN_LOADING_DURATION = 500;

const toE164US = (phone: string): string =>
  `+1${phone.replace(/\D/g, '')}`;

export const ID_PICKUP_OPTIONS = [
  "Driver's License",
  'Photo ID',
  'Birth Certificate',
  'Social Security Card',
  'Other',
] as const;

export interface IdPickupFormValues {
  workerName: string;
  clientName: string;
  clientPhone: string;
  idToPickup: string;
  customIdToPickup: string;
  pickupStreetAddress: string;
  pickupCity: string;
  pickupState: string;
  pickupZipCode: string;
  pickupHours: string;
  additionalComments: string;
}

export interface IdPickupFormErrors {
  workerName?: string;
  clientName?: string;
  clientPhone?: string;
  idToPickup?: string;
  customIdToPickup?: string;
  pickupStreetAddress?: string;
  pickupCity?: string;
  pickupState?: string;
  pickupZipCode?: string;
  pickupHours?: string;
}

const validate = (values: IdPickupFormValues): IdPickupFormErrors => {
  const errors: IdPickupFormErrors = {};

  if (!values.workerName.trim()) errors.workerName = 'Worker name is required';
  if (!values.clientName.trim()) errors.clientName = 'Client name is required';

  if (!values.clientPhone.trim()) {
    errors.clientPhone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(values.clientPhone.trim())) {
    errors.clientPhone = 'Enter a valid phone number (e.g. 215-555-1234)';
  }

  if (!values.idToPickup) {
    errors.idToPickup = 'Please select an ID type';
  } else if (values.idToPickup === 'Other' && !values.customIdToPickup.trim()) {
    errors.customIdToPickup = 'Please specify the ID type';
  }

  if (!values.pickupStreetAddress.trim()) errors.pickupStreetAddress = 'Street address is required';
  if (!values.pickupCity.trim()) errors.pickupCity = 'City is required';

  if (!values.pickupState.trim()) {
    errors.pickupState = 'State is required';
  } else if (!STATE_REGEX.test(values.pickupState.trim().toUpperCase())) {
    errors.pickupState = 'Enter a valid 2-letter state code (e.g. PA)';
  }

  if (!values.pickupZipCode.trim()) {
    errors.pickupZipCode = 'ZIP code is required';
  } else if (!ZIP_REGEX.test(values.pickupZipCode.trim())) {
    errors.pickupZipCode = 'Enter a valid ZIP code (e.g. 19104)';
  }

  if (!values.pickupHours.trim()) errors.pickupHours = 'Pickup hours are required';

  return errors;
};

export default function useIdPickupNotificationForm(
  clientUsername: string,
  workerUsername: string,
  initialWorkerName: string,
  initialClientName: string,
  initialClientPhone: string,
) {
  const alert = useAlert();

  const [formValues, setFormValues] = useState<IdPickupFormValues>({
    workerName: initialWorkerName,
    clientName: initialClientName,
    clientPhone: initialClientPhone,
    idToPickup: '',
    customIdToPickup: '',
    pickupStreetAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupZipCode: '',
    pickupHours: '',
    additionalComments: '',
  });

  const [errors, setErrors] = useState<IdPickupFormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const onChange = (field: keyof IdPickupFormValues, value: string) => {
    const newValues = { ...formValues, [field]: value };
    if (field === 'idToPickup' && value !== 'Other') {
      newValues.customIdToPickup = '';
    }
    setFormValues(newValues);

    if (hasAttemptedSubmit) {
      setErrors(validate(newValues));
    }
  };

  const getIdLabel = (): string => {
    const idLabel = formValues.idToPickup === 'Other'
      ? formValues.customIdToPickup
      : formValues.idToPickup;

    return idLabel;
  };

  const getMessagePreview = (): string => {
    const location = `${formValues.pickupStreetAddress}, ${formValues.pickupCity}, ${formValues.pickupState} ${formValues.pickupZipCode}`;

    let message = `Hi ${formValues.clientName || '___'}, your ${getIdLabel() || '___'} is ready for pickup at ${location || '___'}. Pickup hours: ${formValues.pickupHours || '___'}. Your case worker ${formValues.workerName || '___'} is ready to help with further ID needs.`;

    if (formValues.additionalComments.trim()) {
      message += ` ${formValues.additionalComments}`;
    }

    return message;
  };

  const onSubmit = async (): Promise<IdPickupFormErrors> => {
    setHasAttemptedSubmit(true);
    setServerError('');
    const validationErrors = validate(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return validationErrors;
    }

    const message = getMessagePreview();

    const startTime = Date.now();

    try {
      setIsLoading(true);
      const res = await fetch(`${getServerURL()}/notify-id-pickup`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          workerUsername,
          clientUsername,
          idToPickup: getIdLabel(),
          clientPhoneNumber: toE164US(formValues.clientPhone),
          message,
        }),
      });

      const data = await res.json();

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsedTime);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setIsLoading(false);
      if (data.status === 'SUCCESS') {
        alert.show('Notification sent successfully');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setServerError(data.message || 'Failed to send notification. Please try again.');
      }
    } catch {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsedTime);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setIsLoading(false);
      setServerError('Network error. Please try again.');
    }

    return {};
  };

  return {
    formValues,
    errors,
    hasAttemptedSubmit,
    serverError,
    refreshTrigger,
    isLoading,
    onChange,
    onSubmit,
    getMessagePreview,
  };
}
