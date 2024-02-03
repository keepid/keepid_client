import React from 'react';

function FamilyInformation() {
  return (
    <form action="/handling-form-page" method="post">
      <p className="tw-pl-10 tw-mt-5 tw-text-2xl tw-font-semibold">
        Family Information
      </p>
      <ul className="tw-list-none tw-mb-20">
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="parent-one" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Parent(s)/Guardian(s)</label>
            <input type="text" name="parent-one" id="parent-one" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="parent-two" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Parent(s)/Guardian(s)</label>
            <input type="text" name="parent-two" id="parent-two" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="spouse" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Spouse</label>
            <input type="text" name="spouse" id="spouse" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="children-count" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Number of Children</label>
            <input type="text" name="children-count" id="children-count" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-bg-gray-100 tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="child-one" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Name of Child</label>
            <input type="text" name="child-one" id="child-one" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
          </div>
        </li>
        <li>
          <div className="tw-pr-10 sm:tw-grid sm:tw-grid-cols-5 sm:tw-items-start sm:tw-gap-4 sm:tw-py-2">
            <label htmlFor="child-two" className="tw-col-span-2 tw-pl-5 tw-block tw-text-md tw-font-medium tw-leading-6 tw-text-gray-700 sm:tw-pt-1.5">Name of Child</label>
            <input type="text" name="child-two" id="child-two" className="tw-col-span-3 tw-block tw-w-full tw-rounded-md tw-border-0 tw-py-1.5 tw-text-gray-900 tw-shadow-sm tw-ring-1 tw-ring-inset tw-ring-gray-300 placeholder:tw-text-gray-400 focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-indigo-600 sm:tw-max-w-xs sm:tw-text-sm sm:tw-leading-6" />
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

export default FamilyInformation;
