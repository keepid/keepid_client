import React from 'react';

import { DateInput, SelectInput, TextInput } from '.';
import { BaseInputFieldType, InputType } from './FieldType';
import { TextInputType } from './TextInput';

export interface InputFromFieldProps {
  field: BaseInputFieldType<any>;
  value: any;
  onChange: (value: any) => void;
  className?: string;
  labelClassName?: string;
}

const InputFromField = ({
  field,
  onChange,
  value,
  className,
  labelClassName,
}: InputFromFieldProps): JSX.Element => {
  switch (field.type) {
    case InputType.DATE:
      return (
        <DateInput
          label={field.label}
          name={field.name}
          required={field.required}
          description={field.description}
          placeholder={field.placeholder}
          validate={field.validate}
          defaultValue={field.defaultValue}
          value={value}
          onChange={onChange}
          className={className}
          labelClassName={labelClassName}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field.inputProps}
        />
      );
    case InputType.SELECT:
      return (
        <SelectInput
          label={field.label}
          name={field.name}
          required={field.required}
          description={field.description}
          placeholder={field.placeholder}
          validate={field.validate}
          defaultValue={field.defaultValue}
          value={value}
          onChange={onChange}
          className={className}
          labelClassName={labelClassName}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field.inputProps}
        />
      );
    case InputType.PASSWORD:
      return (
        <TextInput
          label={field.label}
          name={field.name}
          required={field.required}
          description={field.description}
          placeholder={field.placeholder}
          validate={field.validate}
          defaultValue={field.defaultValue}
          value={value}
          onChange={onChange}
          className={className}
          labelClassName={labelClassName}
          type={TextInputType.PASSWORD}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field.inputProps}
        />
      );
    case InputType.EMAIL:
      return (
        <TextInput
          label={field.label}
          name={field.name}
          required={field.required}
          description={field.description}
          placeholder={field.placeholder}
          validate={field.validate}
          defaultValue={field.defaultValue}
          value={value}
          onChange={onChange}
          className={className}
          labelClassName={labelClassName}
          type={TextInputType.EMAIL}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field.inputProps}
        />
      );
    case InputType.TEXT:
    default:
      return (
        <TextInput
          label={field.label}
          name={field.name}
          required={field.required}
          description={field.description}
          placeholder={field.placeholder}
          validate={field.validate}
          defaultValue={field.defaultValue}
          value={value}
          onChange={onChange}
          className={className}
          labelClassName={labelClassName}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field.inputProps}
        />
      );
  }
};

InputFromField.defaultProps = { options: [] };

export default InputFromField;
