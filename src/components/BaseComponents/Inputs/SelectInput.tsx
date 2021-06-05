import classNames from 'classnames';
import React from 'react';
import Select from 'react-select';

import InputProps from './BaseInputProps';
import InputWrapper from './InputWrapper';

interface SelectOption {
  label: string;
  value: string;
}

export interface SelectInputProps extends InputProps<string> {
  options: SelectOption[];
}

const SelectInput = ({
  className: classNameProp,
  defaultValue,
  name,
  onChange,
  options,
  placeholder,
  value,
  ...rest
}: SelectInputProps) => {
  const className = classNames('form-select', 'form-purple', classNameProp);
  return (
    <InputWrapper name={name} {...rest}>
      <Select
        defaultValue={options.find((i) => i.value === defaultValue)}
        className={className}
        inputId={name}
        isClearable={!rest.required}
        name={name}
        onChange={(option) => onChange && onChange(option)}
        options={options}
        placeholder={placeholder}
        value={options.find((i) => i.value === value)}
      />
    </InputWrapper>
  );
};

SelectInput.defaultProps = { options: [] };

export default SelectInput;
