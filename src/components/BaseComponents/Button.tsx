import React, { MouseEvent, ReactNode } from 'react';

interface LoadingButtonProps{
    onClick: () => Promise<void>;
    children: React.ReactNode;
}

export function LoadingButton({ onClick, children }: LoadingButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  const content = loading ? 'Loading...' : children;

  return (
        <button type="button" onClick={handleClick} className="tw-inline-flex tw-w-full tw-justify-center tw-border-0 tw-rounded-md tw-bg-twprimary tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-blue-800 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600">
            {content}
        </button>
  );
}

interface SimpleButtonProps{
    onClick: () => void;
    children: React.ReactNode;
}

export function PrimaryButton({ onClick, children }: SimpleButtonProps) {
  return (
        <button type="button" className="tw-flex tw-justify-center tw-bg-white tw-border tw-border-twprimary tw-rounded-md tw-p-1.5 tw-font-semibold tw-text-twprimary hover:tw-bg-blue-50 hover:tw-no-underline tw-px-3 tw-font-Inter" onClick={onClick}>
            {children}
        </button>
  );
}

export function PrimaryButtonSolid({ onClick, children }: SimpleButtonProps) {
  return (
        <button type="button" className="tw-flex tw-justify-center tw-bg-twprimary tw-rounded-md tw-p-1.5 tw-font-semibold tw-text-white hover:tw-bg-blue-800 hover:tw-no-underline tw-px-3 tw-font-Inter tw-border-0 tw-items-center" onClick={onClick}>
            {children}
        </button>
  );
}
