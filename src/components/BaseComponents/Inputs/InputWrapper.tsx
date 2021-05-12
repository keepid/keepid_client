import classNames from 'classnames';
import React from 'react';
import { Form } from 'react-bootstrap';

export interface InputWrapperProps {
  /**
   * Optional description text to display under the label
   */
  description?: string | undefined;
  /**
   * Label to attach to the input
   */
  label: string;
  /**
   * HTML name attribute to attach to the input
   */
  name: string;
  /**
   * Optional boolean indicating whether the input is required
   */
  required?: boolean | undefined;
  /**
   * Optional className to apply to the label component
   */
  labelClassName?: string | undefined;
  /**
   * Children to render within the input wrapper
   */
  children: JSX.Element | JSX.Element[];
}

const InputWrapper = ({
  children,
  description,
  label,
  name,
  required,
  labelClassName,
}: InputWrapperProps) => {
  const className = classNames('input-label', labelClassName, { required });
  return (
    <Form.Group>
      <Form.Label className={className} htmlFor={name}>{label}</Form.Label>
      {children}
      {description ? <Form.Text>{description}</Form.Text> : null}
    </Form.Group>
  );
};

export default InputWrapper;
