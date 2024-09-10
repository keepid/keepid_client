import React, { useState } from 'react';
import { useAlert } from 'react-alert';

import getServerURL from '../../serverOverride';

function DemoInformation({ data, setData, setPostRequestMade, username }) {
  const [isEditing, setEditing] = useState(false);
  const [originalData, setOriginalData] = useState(data);
  const alert = useAlert();

  const RACE_VALUES = {
    NATIVE_HAWAIIAN: 'Native Hawaiian',
    ALASKA_NATIVE: 'Alaska Native',
    ASIAN: 'Asian',
    AMERICAN_INDIAN: 'American Indian',
    BLACK_AFRICAN_AMERICAN: 'Black or African American',
    OTHER_PACIFIC_ISLANDER: 'Other Pacific Islander',
    WHITE: 'White',
  };

  const CITIZENSHIP = {
    US_CITIZEN: 'U.S. citizen',
    LEGAL_ALLOWED_WORK: 'Legal (Allowed to work)',
    LEGAL_NOT_ALLOWED_WORK: 'Legal (Not allowed to work)',
    OTHER: 'Other',
  };

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
          alert.show('Successfully updated demographic information.');
          setPostRequestMade(true);
        } else {
          alert.show('Error updating demographic information.');
        }
      });
    setEditing(false);
  };
  return (
    <div>
      <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
        Demographic Information
      </p>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
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
                      checked={data.languagePreference === 'English'}
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
                      checked={data.languagePreference === 'Spanish'}
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
                      checked={data.isEthnicityHispanicLatino}
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
                      checked={!data.isEthnicityHispanicLatino}
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
                      id="black_african_american"
                      type="radio"
                      value="BLACK_AFRICAN_AMERICAN"
                      name="race"
                      checked={data.race === 'BLACK_AFRICAN_AMERICAN'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="black_african_american"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Black or African American
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="white"
                      type="radio"
                      value="WHITE"
                      name="race"
                      checked={data.race === 'WHITE'}
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
                      id="american-indian"
                      type="radio"
                      value="AMERICAN_INDIAN"
                      name="race"
                      checked={data.race === 'AMERICAN_INDIAN'}
                      className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="american-indian"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      American Indian
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="asian"
                      type="radio"
                      value="ASIAN"
                      name="race"
                      checked={data.race === 'ASIAN'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="asian"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Asian
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="alaska_native"
                      type="radio"
                      value="ALASKA_NATIVE"
                      name="race"
                      checked={data.race === 'ALASKA_NATIVE'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="alaska_native"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Alaska Native
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="native_hawaiian"
                      type="radio"
                      value="NATIVE_HAWAIIAN"
                      name="race"
                      checked={data.race === 'NATIVE_HAWAIIAN'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="native_hawaiian"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Native Hawaiian
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="other_pacific_islander"
                      type="radio"
                      value="OTHER_PACIFIC_ISLANDER"
                      name="race"
                      checked={data.race === 'OTHER_PACIFIC_ISLANDER'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, race: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="other_pacific_islander"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Other Pacific Islander
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
                      id="us_citizen"
                      type="radio"
                      value="US_CITIZEN"
                      name="legal-status"
                      checked={data.citizenship === 'US_CITIZEN'}
                      className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="us_citizen"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      U.S. citizen
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="legal_allowed_work"
                      type="radio"
                      value="LEGAL_ALLOWED_WORK"
                      name="legal-status"
                      checked={data.citizenship === 'LEGAL_ALLOWED_WORK'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="legal_allowed_work"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Legal (Allowed to work)
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="legal_not_allowed_work"
                      type="radio"
                      value="LEGAL_NOT_ALLOWED_WORK"
                      name="legal-status"
                      checked={data.citizenship === 'LEGAL_NOT_ALLOWED_WORK'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="legal_not_allowed_work"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Legal (Not allowed to work)
                    </label>
                  </div>
                  <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                    <input
                      id="other"
                      type="radio"
                      value="OTHER"
                      name="legal-status"
                      checked={data.citizenship === 'OTHER'}
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, citizenship: e.target.value });
                      }}
                    />
                    <label
                      htmlFor="other"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Other
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
        </form>
      ) : (
        <div>
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
                  {data.isEthnicityHispanicLatino ? 'Yes' : 'No'}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Race
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {RACE_VALUES[data.race]}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Are you a U.S. citizen?
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {CITIZENSHIP[data.citizenship]}
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
              onClick={() => {
                setEditing(true);
                setOriginalData(data);
              }}
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
