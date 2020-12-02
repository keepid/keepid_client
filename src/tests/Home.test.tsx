import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../components/Base/Home';

test('Home page loads', () => {
  const { getByText } = render(<Home />);
  getByText('Safeguarding identities of those experiencing homelessness');
});

test('Home page buttons work', () => {
  const { getByText } = render(<Home />);
  const button = getByText('Get Started');
  userEvent.click(button);
  const button2 = getByText('Learn More');
  userEvent.click(button2);
});
