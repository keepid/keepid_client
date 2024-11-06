import React from 'react';

interface SelectApplicationCardProps {
  iconSrc: string;
  iconAlt: string;
  titleText: string;
  subtitleText: string;
  clickHandler: () => void;
}

export default function SelectApplicationCard({
  iconSrc,
  iconAlt,
  titleText,
  subtitleText,
  clickHandler,
}: SelectApplicationCardProps) {
  return (
    <div onClick={clickHandler} className="tw-border-2 tw-border-gray-500 tw-size-64 tw-flex tw-flex-col tw-items-center">
      <img alt={iconAlt} src={iconSrc} className="tw-w-3/4 tw-max-h-12" />
      <p className="tw-text-lg tw-font-bold">{titleText}</p>
      <p className="tw-text-md">{subtitleText}</p>
    </div>
  );
}
