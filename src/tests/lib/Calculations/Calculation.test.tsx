import { dateFaker } from 'date-faker';

import {
  calculateAge, calculateAgeFromString,
} from '../../../lib/Calculations/Calculation';

test('correct age', () => {
  const birthday = new Date(1975, 1, 1);
  dateFaker.set('2022/01/01');
  expect(calculateAge(birthday) === 2022 - 1975);
});

test('birthday has not passed yet', () => {
  const birthday = new Date(1975, 2, 1);
  dateFaker.set('2022/01/01');
  expect(calculateAge(birthday) === 2022 - 1975 - 1);
});

test('correct age with string', () => {
  const birthday = '01-01-1975';
  dateFaker.set('2022/01/01');
  expect(calculateAgeFromString(birthday) === 2022 - 1975);
});

test('birthday has not passed yet with string', () => {
  const birthday = '02-01-1975';
  dateFaker.set('2022/01/01');
  expect(calculateAgeFromString(birthday) === 2022 - 1975 - 1);
});
