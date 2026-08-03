import React from 'react';

import { normalizePennDotNumber, PENNDOT_NUMBER_LENGTH } from './pennDotNumber';

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
};

const PennDotNumberField = ({
  id,
  value,
  onChange,
  label = 'PennDOT customer number',
  helpText = 'Enter the 8-digit customer number shown on PennDOT records.',
  disabled = false,
  className = '',
}: Props) => (
  <label htmlFor={id} className={className}>
    {label && <span className="tw-block tw-font-medium tw-text-gray-900">{label}</span>}
    <input
      id={id}
      type="text"
      aria-label={label || 'PennDOT customer number'}
      inputMode="numeric"
      autoComplete="off"
      maxLength={PENNDOT_NUMBER_LENGTH}
      className="form-control tw-mt-2"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(normalizePennDotNumber(event.target.value))}
    />
    <span className="tw-mt-2 tw-block tw-text-sm tw-text-gray-600">{helpText}</span>
  </label>
);

export default PennDotNumberField;
