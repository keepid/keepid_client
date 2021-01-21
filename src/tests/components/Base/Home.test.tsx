import React from 'react';
import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../../../components/Base/Home';

window.alert = jest.fn();
test('Home page loads', () => {
  window.alert.mockClear();
  const { getByText } = render(<MemoryRouter><Home /></MemoryRouter>);
  getByText('Safeguarding identities of those experiencing homelessness');
});

test('Home page buttons work', () => {
  window.alert.mockClear();
  const { getByText } = render(<MemoryRouter><Home /></MemoryRouter>);
  const button = getByText('Get Started');
  userEvent.click(button);
  const button2 = getByText('Learn More');
  userEvent.click(button2);
});

test('Home page snapshot test', () => {
  window.alert.mockClear();
  const tree = renderer.create(<MemoryRouter><Home /></MemoryRouter>).toJSON();
  expect(tree).toMatchSnapshot();
});
