import React, { FC, MouseEvent, ReactNode } from 'react';

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
        <button type="button" onClick={handleClick} className="tw-col-start-2 tw-inline-flex tw-w-full tw-justify-center tw-rounded-md tw-bg-primary tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-blue-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600">
            {content}
        </button>
  );
}

interface PrimaryButtonProps{
    onClick: () => void;
    children: React.ReactNode;
}

export function PrimaryButton({ onClick, children }: PrimaryButtonProps) {
  return (
        <button type="button" className="tw-flex tw-justify-center tw-bg-white tw-border tw-border-primary tw-rounded-md tw-p-1.5 tw-font-semibold tw-text-primary hover:tw-bg-blue-50 hover:tw-no-underline tw-px-3 tw-font-Inter" onClick={onClick}>
            {children}
        </button>
  );
}
