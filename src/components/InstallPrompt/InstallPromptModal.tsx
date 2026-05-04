/**
 * Presentational modal shell for the install prompt.
 *
 * Knows nothing about platforms or install state — just renders a centered,
 * focus-trapped, accessible modal with whatever children it's given.
 *
 * Wraps Headless UI's Dialog (already in package.json) so we get a11y for free.
 */

import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function InstallPromptModal({ open, onClose, children }: Props) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="tw-relative tw-z-[1000]"
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="tw-ease-out tw-duration-200"
          enterFrom="tw-opacity-0"
          enterTo="tw-opacity-100"
          leave="tw-ease-in tw-duration-150"
          leaveFrom="tw-opacity-100"
          leaveTo="tw-opacity-0"
        >
          <div className="tw-fixed tw-inset-0 tw-bg-black/40" />
        </Transition.Child>

        <div className="tw-fixed tw-inset-0 tw-overflow-y-auto">
          <div className="tw-flex tw-min-h-full tw-items-center tw-justify-center tw-p-4">
            <Transition.Child
              as={Fragment}
              enter="tw-ease-out tw-duration-200"
              enterFrom="tw-opacity-0 tw-scale-95"
              enterTo="tw-opacity-100 tw-scale-100"
              leave="tw-ease-in tw-duration-150"
              leaveFrom="tw-opacity-100 tw-scale-100"
              leaveTo="tw-opacity-0 tw-scale-95"
            >
              <Dialog.Panel className="tw-w-full tw-max-w-md tw-transform tw-overflow-hidden tw-rounded-xl tw-bg-white tw-p-6 tw-text-left tw-align-middle tw-shadow-xl tw-transition-all">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
