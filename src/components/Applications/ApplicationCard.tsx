import React from 'react';
import { ToggleButton } from 'react-bootstrap';

interface SelectApplicationCardProps {
  iconSrc: string;
  iconAlt: string;
  titleText: string;
  subtitleText: string | null;
  changeHandler?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clickHandler?: (e: React.MouseEvent<HTMLInputElement>) => void;
  name: string;
  checked: boolean;
  disabled: boolean;
  value: string | number;
}

export default function SelectApplicationCard({
  iconSrc,
  iconAlt,
  titleText,
  subtitleText = null,
  changeHandler,
  clickHandler,
  name,
  checked = false,
  disabled = false,
  value,
}: SelectApplicationCardProps) {
  // // eslint-disable-next-line
  // if (value === "PIDL") disabled = true;

  const defaultState = !checked && !disabled;
  return (
    <ToggleButton
      type="radio"
      name={name}
      checked={checked}
      disabled={disabled}
      id={`${name}-${value}`}
      value={value}
      onClick={clickHandler}
      onChange={changeHandler}
      className={`toggle-button tw-border tw-min-h-[8.5rem] tw-w-full tw-flex tw-items-center tw-gap-4
        tw-rounded-lg tw-p-5 tw-text-left tw-shadow-sm tw-transition-all
        ${defaultState ? 'tw-bg-white tw-text-gray-900 hover:tw-bg-blue-50 hover:tw-text-gray-900 !tw-border-gray-200 hover:!tw-border-blue-300 hover:tw-shadow-md ' : ''}
        ${disabled ? '!tw-bg-gray-100 tw-text-gray-500 !tw-border-gray-200 tw-cursor-not-allowed tw-opacity-70' : ''}
        ${checked ? '!tw-bg-blue-50 !tw-text-gray-900 !tw-border-twprimary tw-shadow-md' : ''}`}
    >
      <span className={`tw-flex tw-h-16 tw-w-16 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-bg-white tw-p-3 ${checked ? 'tw-border-blue-200' : 'tw-border-gray-200'}`}>
        <img alt={iconAlt} src={iconSrc} className="tw-h-full tw-w-full tw-object-contain tw-pointer-events-none" />
      </span>
      <span className="tw-min-w-0 tw-flex-1">
        <span className={`tw-block tw-text-lg tw-font-semibold tw-leading-snug tw-pointer-events-none ${disabled ? 'tw-text-gray-500' : 'tw-text-gray-900'}`}>
          {titleText}
        </span>
        {subtitleText && (
          <span className="tw-mt-1 tw-block tw-text-sm tw-text-gray-600 tw-leading-snug tw-pointer-events-none">
            {subtitleText}
          </span>
        )}
      </span>
    </ToggleButton>
  );
}
