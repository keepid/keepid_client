import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useValue } from 'react-cosmos/fixture';

interface BaseInputFixtureProps {
  fixture: (props: any) => JSX.Element,
  type: string,
  otherProps?: object | undefined
}

const BaseInputFixture = ({ fixture: Fixture, type, otherProps }: BaseInputFixtureProps) => {
  const [name] = useValue<string>('name', { defaultValue: `${type}-input-name` });
  const [label] = useValue<string>('label', { defaultValue: `${type}Input Label` });
  const [description] = useValue<string>('description', { defaultValue: `${type} input description` });
  const [placeholder] = useValue<string>('placeholder', { defaultValue: `${type} input placeholder` });
  const [required] = useValue<boolean>('required', { defaultValue: true });
  const [value, setValue] = useState(undefined);
  const logAndSetValue = (value) => { console.log(value); setValue(value); };
  return (
    <Form
      style={{
        border: '1px solid lightgray', margin: '25px', padding: '25px',
      }}
      name="TextInput-test-form"
      onSubmit={(e) => { e.preventDefault(); console.log(e); }}
    >
      <Fixture {...{
        name,
        label,
        description,
        placeholder,
        value,
        onChange: logAndSetValue,
        required,
        ...(otherProps || {}),
      }}
      />
    </Form>
  );
};

BaseInputFixture.defaultProps = { otherProps: {} };

export default BaseInputFixture;
