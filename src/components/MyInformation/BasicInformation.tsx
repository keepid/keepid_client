import 'react-day-picker/dist/style.css';

import { format } from 'date-fns';
import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';

import getServerURL from '../../serverOverride';
import Modal from './ProfileModal';

function BasicInformation({
  data,
  setData,
  setPostRequestMade,
  loadProfilePhoto,
  photo,
  photoAvailable,
  username,
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [originalData, setOriginalData] = useState(data); // create copy of original data

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
        if (status === 'SUCCESS') {
          console.log("Successfully updated user's basic information");
          setPostRequestMade(true);
        } else {
          console.error("Could not update user's basic information.");
        }
      });
    setEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Basic Information
          </p>
          <div className="tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
            {photoAvailable && (
              <img
                className="tw-h-14 tw-rounded-full"
                src={photo}
                alt="User's profile picture"
              />
            )}
            {!photoAvailable && (
              <svg
                className="tw-h-14 tw-w-14 tw-text-gray-300"
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
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Change
            </button>
          </div>

          <ul className="tw-list-none tw-mb-20">
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="first-name"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="last-name"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="suffix"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="gender"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Gender
                </label>
                <input
                  type="text"
                  name="gender"
                  id="gender"
                  value={data.genderAssignedAtBirth}
                  onChange={(e) =>
                    setData({
                      ...data,
                      genderAssignedAtBirth: e.target.value,
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-relative tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="date-of-birth"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Date of birth
                </label>
                <input
                  type="text"
                  name="date-of-birth"
                  id="date-of-birth"
                  autoComplete="bday"
                  value={data.birthDate}
                  onClick={() => setCalendarVisible(true)}
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
                {calendarVisible && (
                  <div className="tw-absolute tw-bg-gray-300 tw-bottom-full tw-left-1/4">
                    <DayPicker
                      captionLayout="dropdown"
                      fromYear={1940}
                      toYear={2025}
                      mode="single"
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = format(date, 'yyyy MM dd');
                          setData({
                            ...data,
                            birthDate: formattedDate,
                          });
                        }
                        setCalendarVisible(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="social-security"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="phone-number"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="res-street-address"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Street address
                </label>
                <input
                  type="text"
                  name="res-street-address"
                  id="res-street-address"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="res-apartment-number"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Apartment number
                </label>
                <input
                  type="text"
                  name="res-apartment-number"
                  id="res-apartment-number"
                  value={data.residentialAddress.apartmentNumber}
                  onChange={(e) =>
                    setData({
                      ...data,
                      residentialAddress: {
                        ...data.residentialAddress,
                        apartmentNumber: e.target.value,
                      },
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="res-city"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  City
                </label>
                <input
                  type="text"
                  name="res-city"
                  id="res-city"
                  value={data.residentialAddress.city}
                  onChange={(e) =>
                    setData({
                      ...data,
                      residentialAddress: {
                        ...data.residentialAddress,
                        city: e.target.value,
                      },
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="res-state"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  State
                </label>
                <input
                  type="text"
                  name="res-state"
                  id="res-state"
                  value={data.residentialAddress.state}
                  onChange={(e) =>
                    setData({
                      ...data,
                      residentialAddress: {
                        ...data.residentialAddress,
                        state: e.target.value,
                      },
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="email"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
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
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-between">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setData(originalData);
              }}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onSubmit={handleSaveEdit}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Save
            </button>
          </div>
          {isModalOpen && (
            <Modal
              setModalOpen={setModalOpen}
              loadProfilePhoto={loadProfilePhoto}
              username={username}
            />
          )}
        </form>
      ) : (
        <div>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Basic Information
          </p>
          <div className="tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
            {photoAvailable && (
              <img
                className="tw-h-14 tw-rounded-full"
                src={photo}
                alt="User's profile picture"
              />
            )}
            {!photoAvailable && (
              <svg
                className="tw-h-14 tw-w-14 tw-text-gray-300"
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
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Change
            </button>
          </div>
          <ul className="tw-list-none tw-mb-20">
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  First name
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.firstName}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Last name
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.lastName}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Suffix
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.suffix}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Gender
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.genderAssignedAtBirth}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Date of birth
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.birthDate}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Social security number
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.ssn}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Phone number
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.phoneNumber}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Residential street address
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.residentialAddress.streetAddress}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Apartment number
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.residentialAddress.apartmentNumber}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  City
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.residentialAddress.city}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  State
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.residentialAddress.state}
                </p>
              </div>
            </li>
            <li>
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Email address
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.emailAddress}
                </p>
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-end">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setOriginalData(data);
              }}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Edit
            </button>
          </div>
          {isModalOpen && (
            <Modal
              setModalOpen={setModalOpen}
              loadProfilePhoto={loadProfilePhoto}
              username={username}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default BasicInformation;
