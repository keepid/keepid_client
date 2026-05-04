/**
 * Install prompt content for iOS Safari.
 *
 * iOS does not support programmatic install — the user must tap the Share
 * icon and choose "Add to Home Screen" themselves. We show a clear,
 * illustrated walkthrough.
 *
 * Self-contained: knows nothing about Android or Desktop.
 */

import { Dialog } from '@headlessui/react';
import React from 'react';

interface Props {
  onDismiss: () => void;
}

export default function IOSContent({ onDismiss }: Props) {
  return (
    <>
      <Dialog.Title className="tw-text-xl tw-font-semibold tw-text-gray-900">
        Add Keep.ID to your Home Screen
      </Dialog.Title>
      <Dialog.Description className="tw-mt-2 tw-text-sm tw-text-gray-600">
        Get one-tap access to your documents and the scanner. It only takes a
        moment.
      </Dialog.Description>

      <ol className="tw-mt-4 tw-space-y-3 tw-text-sm tw-text-gray-700">
        <li className="tw-flex tw-items-start tw-gap-3">
          <span className="tw-flex tw-h-6 tw-w-6 tw-flex-none tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-900 tw-text-xs tw-font-semibold tw-text-white">
            1
          </span>
          <span>
            Tap the{' '}
            <span aria-label="Share button" className="tw-inline-flex tw-items-center tw-gap-1 tw-font-medium">
              {/* iOS Share glyph */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tw-h-4 tw-w-4 tw-inline-block tw-text-blue-600"
                aria-hidden
              >
                <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              Share
            </span>{' '}
            button at the bottom of Safari.
          </span>
        </li>
        <li className="tw-flex tw-items-start tw-gap-3">
          <span className="tw-flex tw-h-6 tw-w-6 tw-flex-none tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-900 tw-text-xs tw-font-semibold tw-text-white">
            2
          </span>
          <span>
            Scroll and tap <strong>Add to Home Screen</strong>.
          </span>
        </li>
        <li className="tw-flex tw-items-start tw-gap-3">
          <span className="tw-flex tw-h-6 tw-w-6 tw-flex-none tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-900 tw-text-xs tw-font-semibold tw-text-white">
            3
          </span>
          <span>
            Tap <strong>Add</strong> in the top right.
          </span>
        </li>
      </ol>

      <p className="tw-mt-4 tw-text-xs tw-text-gray-500">
        Note: this only works in Safari. Chrome and other browsers on iPhone
        cannot install web apps.
      </p>

      <div className="tw-mt-6 tw-flex tw-justify-end">
        <button
          type="button"
          onClick={onDismiss}
          className="tw-rounded-md tw-bg-black tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-gray-800"
        >
          Got it
        </button>
      </div>
    </>
  );
}
