import React from 'react';

export default function ApplicationBreadCrumbs({ pages }) {
  return (
      <nav aria-label="Breadcrumb" className="flex !important">
        <ol className="tw-flex tw-space-x-4 tw-rounded-md tw-bg-white tw-px-6 tw-shadow !important">
          {pages.map((page) => (
            <li key={page.name} className="tw-flex !important">
              <div className="tw-flex tw-items-center !important">
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 44"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="tw-h-full tw-w-6 tw-shrink-0 tw-text-gray-200 !important"
                >
                  <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                </svg>
                <a
                  onClick={page.handle}
                  className="tw-ml-4 tw-text-sm tw-font-medium tw-text-gray-500 tw-hover:text-gray-700 !important"
                >
                  {page.name}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </nav>
  );
}
