import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useValue } from 'react-cosmos/fixture';

interface BaseInputFixtureProps {
  fixture: (props: any) => JSX.Element;
  type: string;
  otherProps?: object | undefined;
}

const BaseInputFixture = ({
  fixture: Fixture,
  type,
  otherProps,
}: BaseInputFixtureProps) => {
  const [name] = useValue<string>('name', {
    defaultValue: `${type}-input-name`,
  });
  const [label] = useValue<string>('label', {
    defaultValue: `${type}Input Label`,
  });
  const [description] = useValue<string>('description', {
    defaultValue: `${type} input description`,
  });
  const [placeholder] = useValue<string>('placeholder', {
    defaultValue: `${type} input placeholder`,
  });
  const [required] = useValue<boolean>('required', { defaultValue: true });
  const [validate] = useValue<boolean>('validate', { defaultValue: false });
  const [value, setValue] = useState<any>(undefined);
  const logAndSetValue = (value) => {
    // eslint-disable-next-line no-console
    console.log(value);
    setValue(value);
  };

  const rest = otherProps || {};
  if (validate === false) {
    // @ts-ignore
    rest.validate = undefined;
  }
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
      }}
    >
      <Fixture
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...{
          name,
          label,
          description,
          placeholder,
          value,
          onChange: logAndSetValue,
          required,
          ...rest,
        }}
      />
      <button type="submit">submit</button>
    </Form>
  );
};

BaseInputFixture.defaultProps = { otherProps: {} };

export default BaseInputFixture;
