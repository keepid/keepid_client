import {
  render,
} from '@testing-library/react';
import React from 'react';
import { Provider, transitions } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';
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

const options = {
  position: 'bottom left',
  timeout: 5000,
  offset: '10vh',
  type: 'info',
  transition: transitions.fade,
  containerStyle: {
    zIndex: 99999,
  },
};

describe('Complete Signupflow Test', () => {
  test('Successful setup', async () => {
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
    global.window.scrollTo = jest.fn();
    render(
      <MemoryRouter>
        <Provider template={AlertTemplate} {...options}>
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
