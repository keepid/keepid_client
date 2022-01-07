/* eslint-disable radix */
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { BaseInputFieldType, InputType } from './FieldType';
import InputFromField from './InputFromField';

const options = new Array(20)
  .fill('')
  .map((i, idx) => ({ label: `Option ${idx}`, value: `option-val-${idx}` }));

const FormFixture = () => {
  const [state, setState] = useState({});

  const fields: BaseInputFieldType<any>[] = [
    {
      label: 'Text Input',
      name: 'text-input',
      required: true,
      description: 'Description for the input',
      type: InputType.TEXT,
      validate: (str) => {
        if (str.length < 5) {
          return 'Value must be at least 5 characters long';
        }
        if (str === 'invalid') {
          return 'invalid string submitted';
        }
        return '';
      },
    },
    {
      inputProps: { options },
      label: 'Select Input',
      name: 'select-input',
      description: 'Description for the input',
      type: InputType.SELECT,
    },
    {
      label: 'Date Input',
      name: 'date-input',
      description: 'Description for the input',
      type: InputType.DATE,
      required: true,
      validate: (date) => {
        if (date < new Date('11-11-2021')) {
          return 'date too early';
        }
        if (date > new Date('11-18-2021')) {
          return 'date too late';
        }
        return '';
      },
    },
  ];

  return (
    <Form
      style={{
        border: '1px solid lightgray',
        margin: '25px',
        padding: '25px',
      }}
      name="TextInput-test-form"
      onSubmit={(e) => {
        // eslint-disable-next-line no-console
        console.log(`Is valid: ${e.currentTarget.checkValidity()}`);

        e.preventDefault();
        e.stopPropagation();

        // eslint-disable-next-line no-console
        console.log(state);
      }}
    >
        {fields.map((f) => (
          <InputFromField
            key={`input-${f.name}`}
            field={f}
            onChange={(val) => setState({ ...state, [f.name]: val })}
            value={state[f.name]}
          />
        ))}

      <Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form.Group>
    </Form>
  );
};

export default FormFixture;
