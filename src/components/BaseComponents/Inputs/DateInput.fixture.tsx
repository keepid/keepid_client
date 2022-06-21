import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useValue } from 'react-cosmos/fixture';

import { DateInput } from '.';
import BaseInputFixture from './BaseInputFixture';

const DateInputFixture = () => {
  const [showTimeSelect] = useValue('showTimeSelect', { defaultValue: false });

  const validate = (date) => {
    if (date < new Date('10-31-2021')) {
      return 'date too early';
    }
    if (date > new Date('11-02-2021')) {
      return 'date too late';
    }
    return '';
  };
  return (
    <BaseInputFixture
      fixture={DateInput}
      type="Date"
      otherProps={{ showTimeSelect, validate }}
    />
  );
};

export default DateInputFixture;
