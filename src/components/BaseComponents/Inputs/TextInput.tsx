import classNames from 'classnames';
import React, { useState } from 'react';
import { InputGroup } from 'react-bootstrap';

import InputProps from './BaseInputProps';
import InputWrapper from './InputWrapper';

export enum TextInputType {
  EMAIL = 'email',
  PASSWORD = 'password',
  TEXT = 'text',
}

export interface TextInputProps extends InputProps<string> {
  type?: TextInputType;
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
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === TextInputType.PASSWORD && showPassword ? TextInputType.TEXT : type;
  return (
    <InputWrapper label={label} name={name} {...rest}>
      <InputGroup>
        <input
          className={className}
          defaultValue={defaultValue}
          id={name}
          name={name}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          required={rest.required}
          type={inputType}
          value={value}
        />
        {type === TextInputType.PASSWORD ? (
          <InputGroup.Append>
            <InputGroup.Text>
              <i
                onClick={() => setShowPassword(!showPassword)}
                className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}
              />
            </InputGroup.Text>
          </InputGroup.Append>
        ) : null}
      </InputGroup>
    </InputWrapper>
  );
};

TextInput.defaultProps = { type: TextInputType.TEXT };

export default TextInput;
