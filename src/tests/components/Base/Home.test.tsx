import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import Home from '../../../components/Home/index';

window.scroll = jest.fn();
test('Home page loads', () => {
  const { getByText } = render(
    <MemoryRouter>
      <IntlProvider locale="en" defaultLocale="en">
        <Home />
      </IntlProvider>
    </MemoryRouter>
  );
  getByText('An identification platform');
});

test('Home page buttons work', () => {
  const { getByText } = render(
    <MemoryRouter>
      <IntlProvider locale="en" defaultLocale="en">
        <Home />
      </IntlProvider>
    </MemoryRouter>
  );
  const button = getByText('Get Started');
  userEvent.click(button);
  const button2 = getByText('Donate');
  userEvent.click(button2);
});

test('Home page snapshot test', () => {
  const tree = renderer
    .create(
      <MemoryRouter>
        <IntlProvider locale="en" defaultLocale="en">
          <Home />
        </IntlProvider>
      </MemoryRouter>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
