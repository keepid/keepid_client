import {
  render,
} from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-alert';
import { MemoryRouter } from 'react-router-dom';

import { addHttp, birthDateStringConverter, CompleteSignupFlow } from '../../../components/SignUp/CompleteSignupFlow';
import Role from '../../../static/Role';

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

describe('Complete Signupflow Test', () => {
  test('Successful setup', async () => {
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider>
          <CompleteSignupFlow
            alert={{
              show: jest.fn(),
            }}
            role={Role.LoggedOut}
          />
        </Provider>
      </MemoryRouter>,
    );
  });
});
