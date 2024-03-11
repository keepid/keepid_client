import React, { useState } from 'react';

import getServerURL from '../../serverOverride';
import Modal from './ProfileModal';

function BasicInformation({ data, setData, setPostRequestMade }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    fetch(`${getServerURL()}/change-optional-info/`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        const { status } = responseJSON;
        if (status === 'success') {
          // TODO: how to handle success and error
          // alert.show('User info updated successfully');
          setPostRequestMade(true);
        } else {
          // alert.show('User info update failed');
        }
      });
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Basic Information
          </p>
          <div className="tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
            <svg
              className="tw-h-12 tw-w-12 tw-text-gray-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Change
            </button>
          </div>

          <ul className="tw-list-none tw-mb-20">
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="first-name"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  First name
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="first-name"
                  autoComplete="given-name"
                  value={data.firstName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      firstName: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="last-name"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Last name
                </label>
                <input
                  type="text"
                  name="last-name"
                  id="last-name"
                  autoComplete="family-name"
                  value={data.lastName}
                  onChange={(e) =>
                    setData({
                      ...data,
                      lastName: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="suffix"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Suffix
                </label>
                <input
                  type="text"
                  name="suffix"
                  id="suffix"
                  autoComplete="honorific-suffix"
                  value={data.suffix}
                  onChange={(e) =>
                    setData({
                      ...data,
                      suffix: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="gender"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Gender
                </label>
                <input
                  type="text"
                  name="gender"
                  id="gender"
                  autoComplete="sex"
                  value={data.genderAssignedAtBirth}
                  onChange={(e) =>
                    setData({
                      ...data,
                      genderAssignedatBirth: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="date-of-birth"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Date of birth
                </label>
                <input
                  type="text"
                  name="date-of-birth"
                  id="date-of-birth"
                  autoComplete="bday"
                  value={data.birthDate}
                  onChange={(e) =>
                    setData({
                      ...data,
                      birthDate: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="social-security"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Social security number
                </label>
                <input
                  type="text"
                  name="social-security"
                  id="social-security"
                  value={data.ssn}
                  onChange={(e) =>
                    setData({
                      ...data,
                      ssn: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="phone-number"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Phone number
                </label>
                <input
                  type="text"
                  name="phone-number"
                  id="phone-number"
                  autoComplete="tel"
                  value={data.phoneNumber}
                  onChange={(e) =>
                    setData({
                      ...data,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="address"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  autoComplete="street-address"
                  value={data.residentialAddress.streetAddress}
                  onChange={(e) =>
                    setData({
                      ...data,
                      residentialAddress: {
                        ...data.residentialAddress,
                        streetAddress: e.target.value,
                      },
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="email"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Email address
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={data.emailAddress}
                  onChange={(e) =>
                    setData({
                      ...data,
                      emailAddress: e.target.value,
                    })
                  }
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label
                  htmlFor="social-worker"
                  className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5"
                >
                  Social worker name
                </label>
                <input
                  type="text"
                  name="social-worker"
                  id="social-worker"
                  className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-between">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onSubmit={handleSaveEdit}
              className="tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Save
            </button>
          </div>
          {isModalOpen && <Modal setModalOpen={setModalOpen} />}
        </form>
      ) : (
        <div>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Basic Information
          </p>
          <div className="tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
            <svg
              className="tw-h-12 tw-w-12 tw-text-gray-300"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Change
            </button>
          </div>
          <ul className="tw-list-none tw-mb-20">
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  First name
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.firstName}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Last name
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.lastName}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Suffix
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.suffix}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Gender
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.genderAssignedAtBirth}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Date of birth
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.birthDate}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Social security number
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.ssn}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Phone number
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.phoneNumber}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Address
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.residentialAddress.streetAddress}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Email address
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.emailAddress}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">
                  Social worker name
                </p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  {data.username}
                </p>
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Edit
            </button>
          </div>
          {isModalOpen && <Modal setModalOpen={setModalOpen} />}
        </div>
      )}
    </div>
  );
}

export default BasicInformation;
