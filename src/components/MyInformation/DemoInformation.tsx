import React from 'react';

function DemoInformation() {
  return (
    <form action="/handling-form-page" method="post">
      <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
        Demographic Information
      </p>
      <ul className="tw-list-none tw-mb-20">
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-mb-0 tw-text-gray-700 sm:tw-pt-1.5">Language Preference</p>
            <div className="tw-flex tw-items-center tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
              <div className="tw-flex tw-items-center tw-me-4">
                <input id="lang-eng" type="radio" value="" name="lang-pref" className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="lang-eng" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">English</label>
              </div>
              <div className="tw-flex tw-items-center tw-me-4">
                <input id="lang-spanish" type="radio" value="" name="lang-pref" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="lang-spanish" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Spanish</label>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-mb-0 tw-text-gray-700 sm:tw-pt-1.5">Ethnicity</p>
            <div className="tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="american-indian" type="radio" value="" name="ethnicity" className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="american-indian" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">American Indian or Alaskan Native</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="asian-pacific" type="radio" value="" name="ethnicity" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="asian-pacific" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Asian / Pacific Islander</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="african-american" type="radio" value="" name="ethnicity" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="african-american" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Black or African American</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="hispanic" type="radio" value="" name="ethnicity" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="hispanic" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Hispanic</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="white" type="radio" value="" name="ethnicity" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="white" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">White / Caucasian</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="multiple" type="radio" value="" name="ethnicity" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="multiple" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Multiple Ethnicity / Other</label>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-mb-0 tw-text-gray-700 sm:tw-pt-1.5">Race</p>
            <div className="tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="american-indian" type="radio" value="" name="race" className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="american-indian" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">American Indian or Alaskan Native</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="asian-pacific" type="radio" value="" name="race" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="asian-pacific" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Asian / Pacific Islander</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="african-american" type="radio" value="" name="race" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="african-american" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Black or African American</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="hispanic" type="radio" value="" name="race" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="hispanic" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Hispanic</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="white" type="radio" value="" name="race" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="white" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">White / Caucasian</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="multiple" type="radio" value="" name="race" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="multiple" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Multiple Ethnicity / Other</label>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <p className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-mb-0 tw-text-gray-700 sm:tw-pt-1.5">U.S. Legal Status</p>
            <div className="tw-col-span-3 tw-w-full tw-py-1.5 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6">
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="citizen" type="radio" value="" name="legal-status" className="tw-w-4 tw-h-4 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="citizen" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">U.S. citizen</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="conditional" type="radio" value="" name="legal-status" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="conditional" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Conditional</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="non-immigrant" type="radio" value="" name="legal-status" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="non-immigrant" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Non-immigrant</label>
              </div>
              <div className="tw-flex tw-mb-2 tw-items-center tw-me-4">
                <input id="undocumented" type="radio" value="" name="legal-status" className="tw-w-4 tw-h-4 tw-text-blue-600 tw-bg-gray-100 tw-border-gray-300 focus:tw-ring-blue-500 dark:focus:tw-ring-blue-600 dark:tw-ring-offset-gray-800 focus:tw-ring-2 dark:tw-bg-gray-700 dark:tw-border-gray-600" />
                <label htmlFor="undocumented" className="tw-mb-0 tw-ms-2 tw-text-sm tw-font-medium">Undocumented immigrant</label>
              </div>
            </div>
          </div>
        </li>
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="place-of-birth" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Place of Birth</label>
            <input type="text" name="place-of-birth" id="place-of-birth" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
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

export default DemoInformation;
