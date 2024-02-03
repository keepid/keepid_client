import React from 'react';

function VeteranInformation() {
  return (
    <form action="/handling-form-page" method="post">
      <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
        Veteran Status Information
      </p>
      <ul className="tw-list-none tw-mb-20">
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-mb-0 tw-text-gray-700 sm:tw-pt-1.5">Are you a veteran?</p>
            <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
              <div className="tw-flex tw-items-center tw-me-4">
                <input id="veteran-yes" type="radio" value="" name="veteran" className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="veteran-yes" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Yes</label>
              </div>
              <div className="tw-flex tw-items-center tw-me-4">
                <input id="veteran-no" type="radio" value="" name="veteran" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="veteran-no" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">No</label>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-mb-0 tw-text-gray-700 sm:tw-pt-1.5">Are you a protected veteran?</p>
            <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
              <div className="tw-flex tw-items-center tw-me-4">
                <input id="protected-veteran-yes" type="radio" value="" name="protected-veteran" className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="protected-veteran-yes" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Yes</label>
              </div>
              <div className="tw-flex tw-items-center tw-me-4">
                <input id="protected-veteran-no" type="radio" value="" name="protected-veteran" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="protected-veteran-no" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">No</label>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="branch" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Branch / Service</label>
            <input type="text" name="branch" id="branch" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="service-years" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Years of Service</label>
            <input type="text" name="service-years" id="service-years" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="discharge-type" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Discharge Type</label>
            <input type="text" name="discharge-type" id="discharge-type" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="discharge-rank" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Rank at Discharge</label>
            <input type="text" name="discharge-rank" id="discharge-rank" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
      </ul>
      <div className="tw-pl-10 tw-flex tw-flex-row tw-justify-between">
        <button
          type="button"
          className="tw-rounded-md tw-bg-white tw-px-2.5 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-gray-900 tw-border-2 tw-border-black hover:tw-bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="tw-rounded-md tw-bg-indigo-600 tw-px-4 tw-py-1.5 tw-text-sm tw-font-semibold tw-text-white tw-border-none hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}

export default VeteranInformation;
