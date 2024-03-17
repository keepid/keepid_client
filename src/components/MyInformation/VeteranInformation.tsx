import React, { useState } from 'react';

import getServerURL from '../../serverOverride';

function VeteranInformation({ data, setData, setPostRequestMade }) {
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
          console.log("Successfully updated user's veteran information");
          setPostRequestMade(true);
        } else {
          console.error("Could not update user's veteran information.");
        }
      });
    setEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <form onSubmit={handleSaveEdit}>
          <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
            Veteran Status Information
          </p>
          <ul className="tw-list-none tw-mb-20">
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <div className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2">
                  Are you a veteran?
                </div>
                <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="veteran-status-yes"
                      type="radio"
                      name="veteran-status"
                      className="tw-w-4 tw-h-4 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, isVeteran: e.target.checked });
                      }}
                    />
                    <label
                      htmlFor="veteran-status-yes"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="veteran-status-no"
                      type="radio"
                      name="veteran-status"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({ ...data, isVeteran: !e.target.checked });
                      }}
                    />
                    <label
                      htmlFor="veteran-status-no"
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
                  Are you a protected veteran?
                </div>
                <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="veteran-protection-yes"
                      type="radio"
                      value=""
                      name="veteran-protection"
                      className="tw-w-4 tw-h-4 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({
                          ...data,
                          isProtectedVeteran: e.target.checked,
                        });
                      }}
                    />
                    <label
                      htmlFor="veteran-protection-yes"
                      className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="tw-flex tw-items-center tw-me-4">
                    <input
                      id="veteran-protection-no"
                      type="radio"
                      value=""
                      name="veteran-protection"
                      className="tw-w-4 tw-h-4 tw-text-blue-600 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600"
                      onChange={(e) => {
                        setData({
                          ...data,
                          isProtectedVeteran: !e.target.checked,
                        });
                      }}
                    />
                    <label
                      htmlFor="veteran-protection-no"
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
                <label
                  htmlFor="branch"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Branch/Service
                </label>
                <input
                  type="text"
                  name="branch"
                  id="branch"
                  value={data.branch}
                  onChange={(e) =>
                    setData({
                      ...data,
                      branch: e.target.value,
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="service-years"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Years of service
                </label>
                <input
                  type="text"
                  name="service-years"
                  id="service-years"
                  value={data.yearsOfService}
                  onChange={(e) =>
                    setData({
                      ...data,
                      yearsOfService: e.target.value,
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="discharge"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Discharge Type
                </label>
                <input
                  type="text"
                  name="discharge"
                  id="discharge"
                  value={data.discharge}
                  onChange={(e) =>
                    setData({
                      ...data,
                      discharge: e.target.value,
                    })
                  }
                  className="tw-col-span-2 tw-block tw-rounded-md tw-border-0 tw-py-1.5 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600"
                />
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-4 sm:tw-grid sm:tw-grid-cols-5">
                <label
                  htmlFor="rank"
                  className="tw-block tw-mb-0 tw-pl-5 tw-font-medium tw-self-center sm:tw-col-span-2"
                >
                  Rank at discharge
                </label>
                <input
                  type="text"
                  name="rank"
                  id="rank"
                  value={data.rank}
                  onChange={(e) =>
                    setData({
                      ...data,
                      rank: e.target.value,
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
            Veteran Status Information
          </p>
          <ul className="tw-list-none tw-mb-20">
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Are you a veteran?
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.veteranStatus ? 'Yes' : 'No'}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Are you a protected veteran?
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.isProtectedVeteran ? 'Yes' : 'No'}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Branch/Service
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.branch}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Years of service
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.yearsOfService}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Discharge status
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.discharge}
                </p>
              </div>
            </li>
            <li className="odd:tw-bg-gray-100">
              <div className="tw-text-md tw-text-gray-700 tw-py-5 sm:tw-grid sm:tw-grid-cols-5">
                <p className="tw-block tw-mb-0 tw-pl-5 tw-font-medium sm:tw-col-span-2">
                  Rank at discharge
                </p>
                <p className="tw-block tw-mb-0 tw-pl-5 sm:tw-col-span-3">
                  {data.discharge}
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

export default VeteranInformation;
