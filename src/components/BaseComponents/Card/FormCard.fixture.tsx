import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelect, useValue } from 'react-cosmos/fixture';

import { DateInput, SelectInput } from '../Inputs';
import TextInput from '../Inputs/TextInput';
import FormCard from './FormCard';

const FormCardFixture = () => {
  const [title] = useValue('title', { defaultValue: 'The Title of the Card' });

  // @ts-ignore
  return (
    <div style={{ padding: '1rem' }}>
      <FormCard title={title}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <div
            style={{
              padding: '1rem',
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
            }}
          >
            <SelectInput
              label="Prefix"
              name="prefix"
              options={[
                { label: 'Mr.', value: 'Mr.' },
                { label: 'Mrs.', value: 'Mrs.' },
                { label: 'Ms.', value: 'Ms.' },
              ]}
            />
            <TextInput label="First Name" name="first-name" required />
            <TextInput label="Last Name" name="last-name" required />
          </div>

          <div
            style={{
              padding: '1rem',
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
            }}
          >
            <DateInput label="Birth Date" name="birth-date" required />
            <TextInput label="Occupation" name="occupation" />
          </div>
        </div>
      </FormCard>
    </div>
  );
};

export default FormCardFixture;
