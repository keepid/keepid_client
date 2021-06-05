import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useValue } from 'react-cosmos/fixture';

import { DateInput } from '.';
import BaseInputFixture from './BaseInputFixture';

const DateInputFixture = () => {
  const [showTimeSelect] = useValue('showTimeSelect', { defaultValue: false });
  return <BaseInputFixture fixture={DateInput} type="Date" otherProps={{ showTimeSelect }} />;
};

export default DateInputFixture;
