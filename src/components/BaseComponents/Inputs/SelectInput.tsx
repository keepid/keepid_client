import classNames from 'classnames';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

import InputProps from './BaseInputProps';
import { performValidation } from './Inputs.util';
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
  validate,
  value,
  ...rest
}: SelectInputProps) => {
  const [invalidMessage, setInvalidMessage] = useState('');
  const [validityChecked, setValidityChecked] = useState(false);

  const className = classNames('form-select', 'form-purple', classNameProp);

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InputWrapper name={name} invalidMessage={invalidMessage} {...rest}>
      <Form.Control
        as="select"
        className={className}
        defaultValue={options.find((i) => i.value === defaultValue)?.value}
        id={name}
        isInvalid={validityChecked && !!invalidMessage}
        isValid={validityChecked && !invalidMessage}
        name={name}
        placeholder={placeholder}
        required={rest.required}
        onChange={async (e) => {
          if (onChange) {
            onChange(e.target.value);
          }
          await performValidation(
            e,
            validate,
            setInvalidMessage,
            setValidityChecked,
          );
        }}
        value={options.find((i) => i.value === value)?.value}
      >
        {placeholder ? (
          <option value="" disabled selected={!(defaultValue || value)}>
            {placeholder}
          </option>
        ) : null}
        {options.map((o) => (
          <option key={`option-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </Form.Control>
    </InputWrapper>
  );
};

SelectInput.defaultProps = { options: [] };

export default SelectInput;
