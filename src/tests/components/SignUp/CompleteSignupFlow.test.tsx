import React from 'react';

import { addHttp, birthDateStringConverter } from '../../../components/SignUp/CompleteSignupFlow';

test('add http test', () => {
  expect(addHttp('https://example.com')).toBe('https://example.com');
  expect(addHttp('https://www.example.com')).toBe('https://www.example.com');
  expect(addHttp('www.example.org/somethinghere')).toBe('http://www.example.org/somethinghere');
});

describe('test birth date string converter function', () => {
  test('JavaScript Date Object should turn into mm-dd-yyyy equivalent', () => {
    const firstDate = new Date('February 19, 2021');
    const formattedDate = birthDateStringConverter(firstDate);
    expect(formattedDate).toBe('02-19-2021');
  });
});
