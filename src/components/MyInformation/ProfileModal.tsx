import React from 'react';

function Modal({ setModalOpen }) {
  // TODO: Add functionality to save the new profile picture
  const handleModalSaveClick = () => {};

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
            <p className="tw-text-gray-400 tw-text-base tw-mb-0">
              Make changes to your profile here. Click save when you are done.
            </p>
            {/* Main body */}
            <div className="tw-flex tw-flex-row tw-py-5 tw-items-center tw-justify-center">
              <svg
                className="tw-h-24 tw-w-24 tw-mr-4 tw-text-gray-300"
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
              <div className="tw-flex tw-items-center tw-justify-center tw-w-full">
                <label
                  htmlFor="dropzone-file"
                  className="tw-py-4 tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-30 tw-border-2 tw-border-gray-300 tw-border-dashed tw-rounded-lg tw-cursor-pointer tw-bg-gray-50"
                >
                  <div className="tw-flex tw-flex-col tw-items-center tw-justify-center">
                    <svg
                      className="tw-w-8 tw-h-8 tw-mb-4 tw-text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="tw-mb-2 tw-text-sm tw-text-gray-500">
                      <span className="tw-font-semibold">Click to upload </span>
                      or drag and drop
                    </p>
                    <p className="tw-text-xs tw-text-gray-500 tw-mb-0">
                      SVG, PNG, JPG or GIF (up to 10MB)
                    </p>
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

export default Modal;
