import React, { useState } from 'react';
import { useAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { enrollWorker } from './SignUp.api';
import { birthDateStringFromIsoDateOnly, localDateFromIsoDateOnly } from './SignUp.util';
import {
  validateBirthdate,
  validateEmail,
  validateFirstname,
  validateLastname,
  validatePhonenumber,
} from './SignUp.validators';

interface EnrollWorkerFormValues {
  firstname: string;
  middlename: string;
  lastname: string;
  suffix: string;
  birthDate: string;
  email: string;
  phonenumber: string;
  personRole: 'Worker' | 'Admin';
}

export default function EnrollWorkerPage(): JSX.Element {
  const alert = useAlert();
  const [values, setValues] = useState<EnrollWorkerFormValues>({
    firstname: '',
    middlename: '',
    lastname: '',
    suffix: '',
    birthDate: '',
    email: '',
    phonenumber: '',
    personRole: 'Worker',
  });
  const [submitting, setSubmitting] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [eulaAgreed, setEulaAgreed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [agreementError, setAgreementError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'firstname':
        error = validateFirstname(value);
        break;
      case 'middlename':
        if (value.trim() !== '') error = validateFirstname(value);
        break;
      case 'lastname':
        error = validateLastname(value);
        break;
      case 'suffix':
        if (value.trim() !== '') error = validateLastname(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phonenumber':
        if (value && value.trim() !== '') error = validatePhonenumber(value);
        break;
      case 'birthDate':
        if (value) {
          const d = localDateFromIsoDateOnly(value);
          error = d === undefined ? 'Invalid birth date' : validateBirthdate(d);
        }
        break;
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!values.birthDate) {
      alert.error('Please enter a valid birth date.');
      return;
    }

    if (!eulaAgreed || !termsAccepted) {
      setAgreementError('You must agree to the EULA and Terms and Conditions before submitting.');
      return;
    }
    setAgreementError('');

    const birthDateString = birthDateStringFromIsoDateOnly(values.birthDate);
    if (!birthDateString) {
      alert.error('Please enter a valid birth date.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await enrollWorker({
        firstname: values.firstname,
        middlename: values.middlename.trim() || undefined,
        lastname: values.lastname,
        suffix: values.suffix.trim() || undefined,
        birthDate: birthDateString,
        email: values.email,
        phonenumber: values.phonenumber,
        personRole: values.personRole,
      });

      if (response.status === 'ENROLL_SUCCESS') {
        setEnrolled(true);
        alert.success(
          `${values.firstname} ${values.lastname} has been enrolled as ${values.personRole}.`,
        );
      } else if (response.status === 'EMAIL_ALREADY_EXISTS') {
        alert.error('A user with this email already exists.');
      } else if (response.status === 'SESSION_TOKEN_FAILURE') {
        alert.error('Your session has expired. Please log in again.');
      } else if (response.status === 'INVALID_PARAMETER') {
        alert.error('Invalid role selected. Please choose Worker or Admin.');
      } else {
        alert.error(`Enrollment failed: ${response.status}`);
      }
    } catch (err) {
      alert.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-text-sm';

  if (enrolled) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-pt-12">
        <div className="tw-max-w-lg tw-mx-auto tw-text-center">
          <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-4">
            {values.personRole} Enrolled Successfully
          </h2>
          <p className="tw-text-gray-600 tw-mb-6">
            <strong>{values.firstname} {values.lastname}</strong> has been enrolled
            as a <strong>{values.personRole}</strong>.
            They can log in via Google OAuth using <strong>{values.email}</strong>,
            or set a password using Forgot Password on the login page.
          </p>
          <div className="tw-flex tw-justify-center tw-space-x-4">
            <button
              type="button"
              className="tw-bg-twprimary tw-text-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-md hover:tw-bg-blue-700 tw-border-0"
              onClick={() => {
                setEnrolled(false);
                setValues({
                  firstname: '',
                  middlename: '',
                  lastname: '',
                  suffix: '',
                  birthDate: '',
                  email: '',
                  phonenumber: '',
                  personRole: 'Worker',
                });
                setEulaAgreed(false);
                setTermsAccepted(false);
                setAgreementError('');
                setFieldErrors({});
              }}
            >
              Enroll Another Worker
            </button>
            <Link to="/my-organization">
              <button
                type="button"
                className="tw-border tw-border-twprimary tw-text-twprimary tw-bg-white tw-font-semibold tw-py-2 tw-px-6 tw-rounded-md hover:tw-bg-blue-50"
              >
                Back to Organization
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
        <title>Enroll Worker</title>
        <meta name="description" content="Keep.id" />
      </Helmet>
      <div className="tw-container tw-mx-auto tw-px-4 tw-pt-8">
        <div className="tw-max-w-xl tw-mx-auto">
          <div className="tw-text-center tw-pb-4 tw-mb-2">
            <h2 className="tw-text-2xl tw-font-bold tw-text-gray-800">
              Enroll a New Worker
            </h2>
            <p className="tw-text-gray-500 tw-mt-2">
              The worker can use Forgot Password to set their password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="tw-space-y-4">
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <div>
                  <label htmlFor="firstname" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    First Name
                  </label>
                  <input
                    id="firstname"
                    name="firstname"
                    type="text"
                    placeholder="First Name"
                    className={inputClassName}
                    value={values.firstname}
                    onChange={onChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    required
                  />
                  {fieldErrors.firstname && (
                    <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.firstname}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="middlename" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Middle Name <span className="tw-text-gray-400 tw-font-normal">(optional)</span>
                  </label>
                  <input
                    id="middlename"
                    name="middlename"
                    type="text"
                    placeholder="Middle Name"
                    className={inputClassName}
                    value={values.middlename}
                    onChange={onChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                  />
                  {fieldErrors.middlename && (
                    <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.middlename}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastname" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastname"
                    name="lastname"
                    type="text"
                    placeholder="Last Name"
                    className={inputClassName}
                    value={values.lastname}
                    onChange={onChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    required
                  />
                  {fieldErrors.lastname && (
                    <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.lastname}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="suffix" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Suffix <span className="tw-text-gray-400 tw-font-normal">(optional)</span>
                  </label>
                  <input
                    id="suffix"
                    name="suffix"
                    type="text"
                    placeholder="Suffix (e.g. Jr, III)"
                    className={inputClassName}
                    value={values.suffix}
                    onChange={onChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                  />
                  {fieldErrors.suffix && (
                    <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.suffix}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Birth Date
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  className={inputClassName}
                  value={values.birthDate}
                  onChange={onChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  required
                />
                {fieldErrors.birthDate && (
                  <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.birthDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={inputClassName}
                  value={values.email}
                  onChange={onChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  required
                />
                {fieldErrors.email && (
                  <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phonenumber" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Phone Number <span className="tw-text-gray-400 tw-font-normal">(optional)</span>
                </label>
                <input
                  id="phonenumber"
                  name="phonenumber"
                  type="tel"
                  placeholder="Phone Number"
                  className={inputClassName}
                  value={values.phonenumber}
                  onChange={onChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                />
                {fieldErrors.phonenumber && (
                  <p className="tw-text-red-600 tw-text-xs tw-mt-1">{fieldErrors.phonenumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="personRole" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                  Role
                </label>
                <select
                  id="personRole"
                  name="personRole"
                  className={inputClassName}
                  value={values.personRole}
                  onChange={onChange}
                >
                  <option value="Worker">Worker</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="tw-mt-6 tw-space-y-3">
              <div className="tw-flex tw-items-start">
                <input
                  type="checkbox"
                  id="eulaAgreement"
                  className="tw-h-4 tw-w-4 tw-mt-0.5 tw-text-blue-600 tw-border-gray-300 tw-rounded focus:tw-ring-blue-500"
                  checked={eulaAgreed}
                  onChange={(e) => {
                    setEulaAgreed(e.target.checked);
                    setAgreementError('');
                  }}
                />
                <label htmlFor="eulaAgreement" className="tw-ml-2 tw-text-sm tw-text-gray-700">
                  By clicking submit, I confirm that the worker agrees to the{' '}
                  <a
                    href="https://docs.google.com/document/d/18O-2Q3hdjeMlDMg696F62rgBhW7fttluUSfYG5lb-uo/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tw-text-blue-600 tw-underline"
                  >
                    End User License Agreement (EULA)
                  </a>
                </label>
              </div>
              <div className="tw-flex tw-items-start">
                <input
                  type="checkbox"
                  id="termsCheck"
                  className="tw-h-4 tw-w-4 tw-mt-0.5 tw-text-blue-600 tw-border-gray-300 tw-rounded focus:tw-ring-blue-500"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setAgreementError('');
                  }}
                />
                <label htmlFor="termsCheck" className="tw-ml-2 tw-text-sm tw-text-gray-700">
                  I have read and agree to the Terms and Conditions and Privacy Policy
                </label>
              </div>
              {agreementError && (
                <p className="tw-text-red-600 tw-text-sm">{agreementError}</p>
              )}
            </div>

            <div className="tw-flex tw-justify-end tw-mt-6">
              <Link to="/my-organization" className="tw-mr-3">
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
                {submitting ? 'Enrolling...' : 'Enroll Worker'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
