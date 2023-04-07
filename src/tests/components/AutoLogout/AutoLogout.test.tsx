import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { act } from 'react-test-renderer';

import AutoLogout from '../../../components/UserAuthentication/AutoLogout';

jest.useFakeTimers();

describe('AutoLogout', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should not show warn modal with mouse activity', () => {
    act(() => {
      // simulate mouse activity
      window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });

    jest.advanceTimersByTime(1000 * 60 * 50); // 50 minutes

    expect(screen.queryByTestId('warn-modal')).toBeNull();

    jest.advanceTimersByTime(1000 * 60 * 10); // 10 minutes

    expect(screen.queryByTestId('warn-modal')).toBeNull();
  });

  it('should show warn modal with keyboard activity', () => {
    act(() => {
      // simulate keyboard activity
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });

    jest.advanceTimersByTime(1000 * 60 * 50); // 50 minutes

    expect(screen.queryByTestId('warn-modal')).toBeNull();

    jest.advanceTimersByTime(1000 * 60 * 10); // 10 minutes

    expect(screen.queryByTestId('warn-modal')).toBeNull();
  });
});
