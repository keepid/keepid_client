/* eslint-disable radix */
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import { DateInput, SelectInput, TextInput } from './index';

const options = new Array(20).fill('').map((i, idx) => ({ label: `Option ${idx}`, value: `option-val-${idx}` }));

const FormFixture = () => {
  const [dateValue, setDateValue] = useState<Date | undefined>();
  const [textValue, setTextValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  return (
    <Form
      style={{
        border: '1px solid lightgray',
        margin: '25px',
        padding: '25px',
      }}
      name="TextInput-test-form"
      onSubmit={(e) => {
        e.preventDefault();
        console.log(e, { textValue, dateValue, selectValue });
      }}
    >
      <TextInput
        label="Text Input"
        name="text-input"
        required
        description="Description for the input"
        value={textValue}
        onChange={setTextValue}
      />
      <SelectInput
        options={options}
        label="Select Input"
        name="select-input"
        description="Description for the input"
        value={selectValue}
        onChange={setSelectValue}
      />

      <DateInput
        label="Date Input"
        name="date-input"
        description="Description for the input"
        value={dateValue}
        onChange={setDateValue}
      />

      <Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form.Group>
    </Form>
  );
};

export default FormFixture;
