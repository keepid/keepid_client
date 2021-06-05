import 'react-datepicker/dist/react-datepicker.css';

import classNames from 'classnames';
import React from 'react';
import DatePicker from 'react-datepicker';

import InputProps from './BaseInputProps';
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
  value,
  ...rest
}: DateInputProps) => {
  const className = classNames('form-control', 'form-purple', classNameProp);

  return (
    <InputWrapper label={label} name={name} {...rest}>
      <DatePicker
        className={className}
        id={name}
        name={name}
        onChange={(d) => onChange && onChange(d)}
        placeholderText={placeholder}
        selected={value || defaultValue}
        showTimeSelect={showTimeSelect}
      />
    </InputWrapper>
  );
};

DateInput.defaultProps = { showTimeSelect: false };

export default DateInput;
