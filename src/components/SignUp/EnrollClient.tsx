import React, { useState } from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { InputType } from '../BaseComponents/Inputs/FieldType';
import StructuredFormFromFields, {
  FormRowType,
} from '../BaseComponents/Inputs/StructuredFormWithRows';
import { enrollClient } from './SignUp.api';
import { birthDateStringConverter } from './SignUp.util';
import {
  validateBirthdate,
  validateEmail,
  validateFirstname,
  validateLastname,
  validatePhonenumber,
} from './SignUp.validators';

interface EnrollClientFormValues {
  firstname: string;
  lastname: string;
  birthDate: Date | undefined;
  email: string;
  phonenumber: string;
}

export default function EnrollClientPage(): JSX.Element {
  const alert = useAlert();
  const [values, setValues] = useState<EnrollClientFormValues>({
    firstname: '',
    lastname: '',
    birthDate: undefined,
    email: '',
    phonenumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const onPropertyChange = (property: string, value: any) => {
    setValues((prev) => ({ ...prev, [property]: value }));
  };

  const rows: FormRowType[] = [
    {
      rowLabel: 'Name',
      fields: [
        {
          label: 'First Name',
          placeholder: 'First Name',
          name: 'firstname',
          type: InputType.TEXT,
          validate: validateFirstname,
        },
        {
          label: 'Last Name',
          placeholder: 'Last Name',
          name: 'lastname',
          type: InputType.TEXT,
          validate: validateLastname,
        },
      ],
    },
    {
      rowLabel: 'Birth Date',
      fields: [
        {
          label: 'Birth Date',
          placeholder: 'Birth Date',
          name: 'birthDate',
          type: InputType.DATE,
          validate: validateBirthdate,
        },
      ],
    },
    {
      rowLabel: 'Email',
      fields: [
        {
          label: 'Email',
          placeholder: 'Email',
          name: 'email',
          type: InputType.TEXT,
          validate: validateEmail,
        },
      ],
    },
    {
      rowLabel: 'Phone Number',
      fields: [
        {
          label: 'Phone Number',
          placeholder: 'Phone Number (optional)',
          name: 'phonenumber',
          type: InputType.TEXT,
          validate: (value: string) => {
            if (!value || value.trim() === '') return '';
            return validatePhonenumber(value);
          },
        },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;

    if (!values.birthDate) {
      alert.error('Please enter a valid birth date.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await enrollClient({
        firstname: values.firstname,
        lastname: values.lastname,
        birthDate: birthDateStringConverter(values.birthDate),
        email: values.email,
        phonenumber: values.phonenumber,
      });

      if (response.status === 'ENROLL_SUCCESS') {
        setEnrolled(true);
        alert.success(
          `${values.firstname} ${values.lastname} has been enrolled. A password-reset email was sent to ${values.email}.`,
        );
      } else if (response.status === 'EMAIL_ALREADY_EXISTS') {
        alert.error('A user with this email already exists.');
      } else if (response.status === 'CLIENT_ENROLL_CLIENT') {
        alert.error('Only workers, admins, or directors can enroll clients.');
      } else if (response.status === 'SESSION_TOKEN_FAILURE') {
        alert.error('Your session has expired. Please log in again.');
      } else {
        alert.error(`Enrollment failed: ${response.status}`);
      }
    } catch (err) {
      alert.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (enrolled) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-pt-12">
        <div className="tw-max-w-lg tw-mx-auto tw-text-center">
          <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4">
            Client Enrolled Successfully
          </h2>
          <p className="tw-text-gray-600 tw-mb-6">
            <strong>{values.firstname} {values.lastname}</strong> has been enrolled.
            A password-reset email has been sent to <strong>{values.email}</strong> so
            they can set their own password. They can also log in via Google OAuth
            using the same email.
          </p>
          <div className="tw-flex tw-justify-center tw-space-x-4">
            <button
              type="button"
              className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-md hover:tw-bg-blue-700 tw-border-0"
              onClick={() => {
                setEnrolled(false);
                setValues({ firstname: '', lastname: '', birthDate: undefined, email: '', phonenumber: '' });
              }}
            >
              Enroll Another Client
            </button>
            <Link to="/home">
              <button
                type="button"
                className="tw-border tw-border-twprimary tw-text-twprimary tw-bg-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-md hover:tw-bg-blue-50"
              >
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Enroll Client</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="tw-container tw-mx-auto tw-px-4 tw-pt-8">
        <div className="tw-max-w-2xl tw-mx-auto">
          <div className="tw-text-center tw-pb-4 tw-mb-2">
            <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">
              Enroll a New Client
            </h2>
            <p className="tw-text-gray-500 tw-mt-2">
              The client will receive an email to set their password.
            </p>
          </div>
          <StructuredFormFromFields
            rows={rows}
            onSubmit={handleSubmit}
            onPropertyChange={onPropertyChange}
            values={values}
            labelClassName="d-none"
          >
            <div className="tw-flex tw-justify-end tw-mt-6">
              <Link to="/home" className="tw-mr-3">
                <button
                  type="button"
                  className="tw-border tw-border-gray-300 tw-text-gray-700 tw-bg-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-md hover:tw-bg-gray-50"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-md hover:tw-bg-blue-700 tw-border-0 disabled:tw-opacity-50"
              >
                {submitting ? 'Enrolling...' : 'Enroll Client'}
              </button>
            </div>
          </StructuredFormFromFields>
        </div>
      </div>
    </div>
  );
}
