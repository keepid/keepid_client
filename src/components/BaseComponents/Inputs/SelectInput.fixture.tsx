import React from 'react';

import { SelectInput } from '.';
import BaseInputFixture from './BaseInputFixture';

const options = new Array(20).fill('').map((i, idx) => ({ label: `Option ${idx}`, value: `option-val-${idx}` }));

const SelectInputFixture = () => <BaseInputFixture fixture={SelectInput} otherProps={{ options }} type="Select" />;
export default SelectInputFixture;
