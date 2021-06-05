import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useSelect } from 'react-cosmos/fixture';

import { TextInput } from '.';
import BaseInputFixture from './BaseInputFixture';
import { TextInputType } from './TextInput';

const TextInputFixture = () => {
  const [type] = useSelect('type', { options: Object.values(TextInputType), defaultValue: TextInputType.TEXT });
  return <BaseInputFixture fixture={TextInput} type="Text" otherProps={{ type }} />;
};

export default TextInputFixture;
