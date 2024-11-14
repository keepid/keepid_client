import React from 'react';
import { Button, ToggleButton } from 'react-bootstrap';

interface SelectApplicationCardProps {
  iconSrc: string;
  iconAlt: string;
  titleText: string;
  subtitleText: string | null;
  clickHandler: () => void;
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
  clickHandler,
  name,
  checked = false,
  disabled = false,
  value,
}: SelectApplicationCardProps) {
  return (
    <ToggleButton
      type="radio"
      name={name}
      checked={checked}
      disabled={disabled}
      id={`${name}-${value}`}
      value={value}
      onChange={clickHandler}
      className={`toggle-button tw-border-2 tw-border-gray-300 tw-h-52 tw-w-56 tw-flex tw-flex-col tw-place-content-center
        tw-bg-transparent tw-text-black tw-rounded-lg tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.15)]
        hover:tw-bg-gray-100 hover:tw-text-black
        ${checked ? '!tw-bg-transparent !tw-border-gray-500 !tw-shadow-[0px_0px_8px_4px_rgba(0,0,0,0.4)]' : ''}`}
    >
      <img alt={iconAlt} src={iconSrc} className="tw-my-4 tw-h-16 tw-w-auto tw-aspect-auto" />
      <p className={`tw-text-base tw-font-bold tw-mb-2 ${checked ? 'tw-text-black' : ''}`}>{titleText}</p>
      {subtitleText && <p className="tw-text-xs tw-text-gray-700">{subtitleText}</p>}
    </ToggleButton>
  );
}
