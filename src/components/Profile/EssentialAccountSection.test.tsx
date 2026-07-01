/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import EssentialAccountSection from './EssentialAccountSection';
import type { ProfileData } from './ProfilePage';

vi.mock('react-alert', () => ({
  useAlert: () => ({
    show: vi.fn(),
  }),
}));

vi.mock('../../serverOverride', () => ({
  default: () => 'http://localhost:7001',
}));

const profile: ProfileData = {
  username: 'demo-client',
  firstName: 'Demo',
  lastName: 'Client',
  email: 'demo@example.org',
};

describe('EssentialAccountSection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('keeps focus in an edited phone number input after the phone value changes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      json: async () => ({
        status: 'SUCCESS',
        phoneBook: [
          { label: 'primary', phoneNumber: '2155550100' },
        ],
      }),
    })));

    render(<EssentialAccountSection profile={profile} />);

    await screen.findByText('(215) 555 - 0100');

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const phoneInput = screen.getByPlaceholderText('Phone number');
    phoneInput.focus();

    fireEvent.change(phoneInput, { target: { value: '21555501008' } });

    expect(screen.getByDisplayValue('21555501008')).toHaveFocus();
  });
});
