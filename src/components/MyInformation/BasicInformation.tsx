import React, { useEffect, useState } from 'react';

import getServerURL from '../../serverOverride';

function Modal({ setModalOpen }) {
  return (
    <div>
      <div className="tw-fixed tw-inset-0 tw-bg-black tw-opacity-50" />
      <div
        id="crud-modal"
        aria-hidden="true"
        className="tw-fixed tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2"
      >
        <div className="tw-relative tw-p-4 tw-w-full tw-max-h-full">
          {/* Main content */}
          <div className="tw-relative tw-bg-white tw-rounded-lg tw-shadow tw-p-6">
            {/* Main header */}
            <p className="tw-font-semibold tw-text-base tw-mb-1">
              Edit Profile Picture
            </p>
            <p className="tw-text-gray-400 tw-text-base tw-mb-0">Make changes to your profile here. Click save when you are done.</p>
            {/* Main body */}
            <div className="tw-flex tw-flex-row tw-py-5 tw-items-center tw-justify-center">
              <svg className="tw-h-24 tw-w-24 tw-mr-4 tw-text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
              <div className="tw-flex tw-items-center tw-justify-center tw-w-full">
                <label htmlFor="dropzone-file" className="tw-py-4 tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-30 tw-border-2 tw-border-gray-300 tw-border-dashed tw-rounded-lg tw-cursor-pointer tw-bg-gray-50">
                  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
                    <svg className="tw-w-8 tw-h-8 tw-mb-4 tw-text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p className="tw-mb-2 tw-text-sm tw-text-gray-500">
                      <span className="tw-font-semibold">Click to upload </span>
                      or drag and drop
                    </p>
                    <p className="tw-text-xs tw-text-gray-500 tw-mb-0">SVG, PNG, JPG or GIF (up to 10MB)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="tw-hidden" />
                </label>
              </div>
            </div>
            {/* Main exit */}
            <div className="tw-flex tw-flex-row tw-justify-between">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
              >
                Save Changes
              </button>
              <button
                type="submit"
                onClick={() => setModalOpen(false)}
                className="tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicInformation() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    // user info
    username: '',

    // basic info
    birthDate: new Date(),
    firstName: '',
    lastName: '',
    gender: '',
    suffix: '',
    email: '',
    phone: '',
    ssc: '',

    // address info
    address: '',
    city: '',
    state: '',
    zipcode: '',
  });
  const fetchProfilePic = () => {
  };
  const fetchUserProfile = () => {
    // fetch user info
    fetch(`${getServerURL()}/get-user-info`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((responseJSON) => {
        const date = responseJSON.birthDate.split('-');
        setBasicInfo((prevBasicInfo) => ({
          ...prevBasicInfo,
          username: responseJSON.username,
          firstName: responseJSON.firstName,
          lastName: responseJSON.lastName,
          birthDate: new Date(date[2], date[0] - 1, date[1]),
          suffix: responseJSON.suffix,
          gender: responseJSON.gender,
          email: responseJSON.email,
          phone: responseJSON.phone,
          city: responseJSON.city,
          state: responseJSON.state,
          address: responseJSON.address,
          zipcode: responseJSON.zipcode,
          // TODO need to get social security number
          // TODO replace all info with applicant
          // TODO get social worker name
        }));
      });
  };
  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  const handleSaveEdit = () => {
  };
  const handleModalChangeClick = () => {
  };
  const handleDashboardClick = () => {
  };
  const handleModalSaveClick = () => {
  };
  const handleModalCancelClick = () => {
  };
  // fetch user profile when component mounts
  useEffect(() => {
    fetchUserProfile();
    fetchProfilePic();
    // TODO to set dependencies to if info save buttons are clicked
  }, []);
  return (
    <div>
      {isEditing ? (
        <form action="/handling-form-page" method="post">
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Basic Information
          </p>
          <div className="tw-pl-10 tw-my-8 tw-flex tw-items-center tw-gap-x-3">
            <svg className="tw-h-12 tw-w-12 tw-text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
            </svg>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Change
            </button>
          </div>
          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
          <ul className="tw-list-none tw-mb-20">
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="first-name" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">First name</label>
                <input type="text" name="first-name" id="first-name" autoComplete="given-name" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="last-name" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Last name</label>
                <input type="text" name="last-name" id="last-name" autoComplete="family-name" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="suffix" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Suffix</label>
                <input type="text" name="suffix" id="suffix" autoComplete="honorific-suffix" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="gender" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Gender</label>
                <input type="text" name="gender" id="gender" autoComplete="sex" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="date-of-birth" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Date of birth</label>
                <input type="text" name="date-of-birth" id="date-of-birth" autoComplete="bday" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="social-security" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Social security number</label>
                <input type="text" name="social-security" id="social-security" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="phone-number" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Phone number</label>
                <input type="text" name="phone-number" id="phone-number" autoComplete="tel" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="address" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Address</label>
                <input type="text" name="address" id="address" autoComplete="street-address" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="email" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Email address</label>
                <input type="text" name="email" id="email" autoComplete="email" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <label htmlFor="social-worker" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Social worker name</label>
                <input type="text" name="social-worker" id="social-worker" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-between">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
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
            <svg className="tw-h-12 tw-w-12 tw-text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
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
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">First name</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.firstName}</p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Last name</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.lastName}</p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Suffix</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.suffix}</p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Gender</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.gender}</p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Date of birth</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.birthDate.toDateString()}</p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Social security number</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Phone number</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.phone}</p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Address</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.address}</p>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Email address</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.email}</p>
              </div>
            </li>
            <li>
              <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
                <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Social worker name</p>
                <p className="tw-col-span-3 tw-block tw-w-full tw-py-1.5 tw-text-gray-900 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">{basicInfo.username}</p>
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-end">
            <button
              type="button"
              onClick={handleEditClick}
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
