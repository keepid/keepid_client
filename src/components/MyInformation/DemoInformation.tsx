import React, { useState } from 'react';

import getServerURL from '../../serverOverride';

function DemoInformation({ data, setData, setPostRequestMade }) {
  const [isEditing, setEditing] = useState(false);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    fetch(`${getServerURL()}/save-optional-info/`, {
      method: 'POST',
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
          console.log("Successfully updated user's demographic information");
          setPostRequestMade(true);
        } else {
          console.error("Could not update user's demographic information.");
        }
      });
    setEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Demographic Information
          </p>
          <ul className="tw-list-none tw-mb-20">
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                  Language preference
                </div>
                <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="lang-eng"
                      type="radio"
                      name="lang-pref"
                      className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, languagePreference: 'English' });
                      }}
                    />
                    <label
                      htmlFor="lang-eng"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      English
                    </label>
                  </div>
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="lang-spanish"
                      type="radio"
                      value=""
                      name="lang-pref"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, languagePreference: 'Spanish' });
                      }}
                    />
                    <label
                      htmlFor="lang-spanish"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Spanish
                    </label>
                  </div>
                </div>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                  Are you Hispanic/Latino?
                </div>
                <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="hispanic-yes"
                      type="radio"
                      name="hispanic"
                      className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, isEthnicityHispanicLatino: true });
                      }}
                    />
                    <label
                      htmlFor="hispanic-yes"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="hispanic-no"
                      type="radio"
                      value=""
                      name="hispanic"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, isEthnicityHispanicLatino: false });
                      }}
                    />
                    <label
                      htmlFor="lhispanic-no"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      No
                    </label>
                  </div>
                </div>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                  Race
                </div>
                <div className="tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="american-indian"
                      type="radio"
                      value="American Indian or Alaskan Native"
                      name="race"
                      className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="american-indian"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      American Indian or Alaskan Native
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="asian-pacific"
                      type="radio"
                      value="Asian / Pacific Islander"
                      name="race"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="asian-pacific"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Asian / Pacific Islander
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="african-american"
                      type="radio"
                      value="Black or African American"
                      name="race"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="african-american"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Black or African American
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="hispanic"
                      type="radio"
                      value="Hispanic"
                      name="race"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="hispanic"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Hispanic
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="white"
                      type="radio"
                      value="White / Caucasian"
                      name="race"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="white"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      White / Caucasian
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="multiple"
                      type="radio"
                      value="Multiple Ethnicity / Other"
                      name="race"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="multiple"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Multiple Ethnicity / Other
                    </label>
                  </div>
                </div>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                  U.S. citizen status
                </div>
                <div className="tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="citizen"
                      type="radio"
                      value="U.S. citizen"
                      name="legal-status"
                      className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="citizen"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      U.S. citizen
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="conditional"
                      type="radio"
                      value="Conditional"
                      name="legal-status"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="conditional"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Conditional
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="non-immigrant"
                      type="radio"
                      value="Non-immigrant"
                      name="legal-status"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="non-immigrant"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Non-immigrant
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="undocumented"
                      type="radio"
                      value="Undocumented immigrant"
                      name="legal-status"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="undocumented"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Undocumented immigrant
                    </label>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="tw-bg-gray-100 tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="birth-country"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Country of birth
                </label>
                <input
                  type="text"
                  name="birth-country"
                  id="birth-country"
                  value={data.countryOfBirth}
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                  onChange={(e) =>
                    setData({
                      ...data,
                      countryOfBirth: e.target.value,
                    })
                  }
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
              type="submit"
              onSubmit={handleSaveEdit}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Demographic Information
          </p>
          <ul className="tw-list-none tw-mb-20">
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Language of preference
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.languagePreference}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Are you Hispanic or Latino?
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.isHispanicOrLatino ? 'Yes' : 'No'}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Race
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.race}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Are you a U.S. citizen?
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.citizenship}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Country of birth
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.countryOfBirth}
                </p>
              </div>
            </li>
          </ul>
          <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="tw-w-20 tw-h-10 tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DemoInformation;
