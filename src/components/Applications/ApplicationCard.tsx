import React from 'react';
import { Button, ToggleButton } from 'react-bootstrap';

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
      className={`toggle-button tw-border-2 tw-min-h-[260px] tw-min-w-56 tw-flex tw-flex-col tw-place-content-center
        tw-rounded-lg tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.15)] 
        ${defaultState ? 'tw-bg-transparent tw-text-black hover:tw-bg-gray-100 hover:tw-text-black !tw-border-gray-300 hover:!tw-border-gray-500 ' : ''}
        ${disabled ? '!tw-bg-gray-300 tw-text-black !tw-border-gray-500' : ''}
        ${checked ? '!tw-bg-indigo-100 !tw-border-gray-500 !tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.4)]' : ''}`}
    >
      <img alt={iconAlt} src={iconSrc} className="tw-my-4 tw-h-24 tw-w-auto tw-aspect-auto tw-pointer-events-none" />
      <p className={
        `tw-text-lg tw-font-bold tw-mb-2 !active:tw-text-black tw-pointer-events-none tw-text-black
        ${checked ? '' : ''}
        ${disabled ? 'tw-opacity-70 ' : ''}`}
      >{titleText}
      </p>
      {subtitleText && <p className="tw-text-sm tw-text-gray-700 !active:tw-text-black tw-pointer-events-none">{subtitleText}</p>}
    </ToggleButton>
  );
}
