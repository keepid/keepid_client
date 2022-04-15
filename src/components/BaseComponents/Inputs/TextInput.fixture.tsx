import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelect } from 'react-cosmos/fixture';

import { TextInput } from '.';
import BaseInputFixture from './BaseInputFixture';
import { TextInputType } from './TextInput';

function TextInputFixture() {
  const [type] = useSelect('type', {
    options: Object.values(TextInputType),
    defaultValue: TextInputType.TEXT,
  });

  const validate = (str) => {
    if (str.length < 5) {
      return 'Value must be at least 5 characters long';
    }
    if (str === 'invalid') {
      return 'invalid string submitted';
    }
    return '';
  };

  return (
    <BaseInputFixture
      fixture={TextInput}
      type="Text"
      otherProps={{ type, validate }}
    />
  );
}

export default TextInputFixture;
