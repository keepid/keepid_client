import classNames from 'classnames';
import React from 'react';

import InputProps from './BaseInputProps';
import InputWrapper from './InputWrapper';

export enum TextInputType {
  EMAIL = 'email',
  PASSWORD = 'password',
  TEXT = 'text'
}

export interface TextInputProps extends InputProps<string> {
  type?: TextInputType
}

const TextInput = ({
  className: classNameProp,
  defaultValue,
  label,
  name,
  onChange,
  placeholder,
  type,
  value,
  ...rest
}: TextInputProps) => {
  const className = classNames('form-control', 'form-purple', classNameProp);
  return (
    <InputWrapper label={label} name={name} {...rest}>
      <input
        className={className}
        defaultValue={defaultValue}
        id={name}
        name={name}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        required={rest.required}
        type={type}
        value={value}
      />
    </InputWrapper>
  );
};

TextInput.defaultProps = { type: TextInputType.TEXT };

export default TextInput;
