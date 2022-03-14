import 'react-datepicker/dist/react-datepicker.css';

import classNames from 'classnames';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

import InputProps from './BaseInputProps';
import { performValidationWithCustomTarget } from './Inputs.util';
import InputWrapper from './InputWrapper';

interface DateInputProps extends InputProps<Date | undefined> {
  showTimeSelect?: boolean | undefined;
}

const DateInput = ({
  className: classNameProp,
  defaultValue,
  name,
  label,
  onChange,
  placeholder,
  showTimeSelect,
  validate,
  value,
  ...rest
}: DateInputProps) => {
  const [invalidMessage, setInvalidMessage] = useState('');
  const [validityChecked, setValidityChecked] = useState(false);
  const className = classNames('form-control', 'form-purple', classNameProp, {
    'is-invalid': validityChecked && !!invalidMessage,
  });

  const [target, setTarget] = useState<HTMLInputElement>();

  return (
    <InputWrapper
      label={label}
      name={name}
      invalidMessage={invalidMessage}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      <Form.Control
        as={DatePicker}
        onFocus={(e) => setTarget(e.target)}
        className={className}
        id={name}
        isInvalid={validityChecked && !!invalidMessage}
        isValid={validityChecked && !invalidMessage}
        name={name}
        onChange={(date) => {
          performValidationWithCustomTarget(
            date,
            validate,
            setInvalidMessage,
            setValidityChecked,
            target,
          );
          if (onChange) {
            // @ts-ignore
            onChange(date);
          }
        }}
        placeholderText={placeholder}
        required={rest.required}
        selected={value || defaultValue}
        showTimeSelect={showTimeSelect}
        dateFormat={`MM/dd/yyyy${showTimeSelect ? ' h:mm aa' : ''}`}
      />
      {/* This hidden input is a hack to ensure that the `Form.Control.Feedback` in the `InputWrapper` component renders properly  */}
      <Form.Control
        data-testid={`hidden-text-input-${name}`}
        className="d-none"
        isInvalid={validityChecked && !!invalidMessage}
        isValid={validityChecked && !invalidMessage}
      />
    </InputWrapper>
  );
};

DateInput.defaultProps = { showTimeSelect: false };

export default DateInput;
