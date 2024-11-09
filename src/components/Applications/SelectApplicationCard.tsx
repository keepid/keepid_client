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
      className="toggle-button tw-border-2 tw-border-gray-500 tw-h-52 tw-w-56 tw-flex tw-flex-col tw-items-center
        tw-bg-transparent tw-text-black tw-rounded-lg"
    >
      <img alt={iconAlt} src={iconSrc} className="tw-mb-4 tw-mt-8 tw-h-16 tw-w-auto tw-aspect-auto" />
      <p className="tw-text-base tw-font-bold">{titleText}</p>
      {subtitleText && <p className="tw-text-md">{subtitleText}</p>}
    </ToggleButton>
  );
}
