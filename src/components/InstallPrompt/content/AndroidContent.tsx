/**
 * Install prompt content for Android (and any Chromium-based browser that
 * supports `beforeinstallprompt`).
 *
 * Self-contained: knows nothing about iOS or Desktop. If the Android UX
 * needs to change, this is the only file to touch.
 */

import { Dialog } from '@headlessui/react';
import React from 'react';

interface Props {
  canPromptNatively: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export default function AndroidContent({
  canPromptNatively,
  onInstall,
  onDismiss,
}: Props) {
  return (
    <>
      <Dialog.Title className="tw-text-xl tw-font-semibold tw-text-gray-900">
        Install Keep.ID on your phone
      </Dialog.Title>
      <Dialog.Description className="tw-mt-2 tw-text-sm tw-text-gray-600">
        Stay logged in and access your documents anytime.
      </Dialog.Description>

      <div className="tw-mt-6 tw-flex tw-justify-end tw-gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="tw-rounded-md tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-600 hover:tw-bg-gray-100"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={onInstall}
          disabled={!canPromptNatively}
          className="tw-rounded-md tw-bg-black tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white hover:tw-bg-gray-800 disabled:tw-cursor-not-allowed disabled:tw-bg-gray-300"
          title={
            canPromptNatively
              ? undefined
              : 'Your browser is not ready to install yet. Try again in a moment.'
          }
        >
          Install
        </button>
      </div>
    </>
  );
}
