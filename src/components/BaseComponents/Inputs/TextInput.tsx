import classNames from 'classnames';
import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import InputProps from './BaseInputProps';
import { performValidation } from './Inputs.util';
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
  validate: validateProp,
  value,
  ...rest
}: TextInputProps) => {
  const className = classNames('form-control', 'form-purple', classNameProp);
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === TextInputType.PASSWORD && showPassword ? TextInputType.TEXT : type;

  const [invalidMessage, setInvalidMessage] = useState('');
  const [validityChecked, setValidityChecked] = useState(false);

  const validate = (e) =>
    performValidation(e, validateProp, setInvalidMessage, setValidityChecked);

  return (
    <InputWrapper
      label={label}
      name={name}
      invalidMessage={invalidMessage}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
    >
      <InputGroup hasValidation>
        <Form.Control
          as="input"
          onBlur={validate}
          className={className}
          defaultValue={defaultValue}
          id={name}
          isInvalid={validityChecked && !!invalidMessage}
          isValid={validityChecked && !invalidMessage}
          name={name}
          onChange={async (e) => {
            if (onChange) {
              onChange(e.target.value);
            }
            if (invalidMessage) {
              await validate(e);
            }
          }}
          placeholder={placeholder}
          required={rest.required}
          type={inputType}
          value={value}
        />
        {type === TextInputType.PASSWORD ? (
          <InputGroup.Append>
            <InputGroup.Text onClick={() => setShowPassword(!showPassword)}>
              <i
                className={classNames('fas', 'hide-text-input-icon', {
                  'fa-eye-slash': showPassword,
                  'fa-eye': !showPassword,
                })}
              />
            </InputGroup.Text>
          </InputGroup.Append>
        ) : null}
      </InputGroup>

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

TextInput.defaultProps = { type: TextInputType.TEXT };

export default TextInput;
