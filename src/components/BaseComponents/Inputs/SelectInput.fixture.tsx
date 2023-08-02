import React from 'react';

import { SelectInput } from '.';
import BaseInputFixture from './BaseInputFixture';

const options = new Array(20)
  .fill('')
  .map((i, idx) => ({ label: `Option ${idx}`, value: `option-val-${idx}` }));

const validate = (opt) => {
  if (opt === 'option-val-1') {
    return 'option 1 is invalid';
  }
  return '';
};

function SelectInputFixture() {
  return (
<BaseInputFixture
  fixture={SelectInput}
  otherProps={{ options, validate }}
  type="Select"
/>
  );
}
export default SelectInputFixture;
