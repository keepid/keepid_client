import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import renderer from 'react-test-renderer';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dialog from '../../../components/Base/Dialog';

test('Dialog buttons work', () => {
  const { getByText } = render(<MemoryRouter><Dialog modalType="CONFIRM" modalTitle="Here is some info you should know" modalDescription="I will not close if you click outside me. blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah" modalIcon="" /></MemoryRouter>);
  // to launch modal
  const button = getByText('Launch Modal');
  userEvent.click(button);
  // closes modal
  const button2 = getByText('Cancel');
  userEvent.click(button2);
  // relaunches modal
  userEvent.click(button);
  const button3 = getByText('Confirm Action');
  userEvent.click(button3);
});

test('custom message shows up', () => {
  const { getByText } = render(<MemoryRouter><Dialog modalType="CONFIRM" modalTitle="Here is some info you should know" modalDescription="I will not close if you click outside me. blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah" modalIcon="" /></MemoryRouter>);
  // to launch modal
  const button = getByText('Launch Modal');
  userEvent.click(button);
  getByText('I will not close if you click outside me. blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah');
});

test('custom title shows up', () => {
  const { getByText } = render(<MemoryRouter><Dialog modalType="CONFIRM" modalTitle="Here is some info you should know" modalDescription="I will not close if you click outside me. blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah" modalIcon="" /></MemoryRouter>);
  // to launch modal
  const button = getByText('Launch Modal');
  userEvent.click(button);
  getByText('Here is some info you should know');
});
