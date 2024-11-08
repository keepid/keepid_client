import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { act } from 'react-test-renderer';

import AutoLogout from '../../../components/UserAuthentication/AutoLogout';
import { sleep } from '../../test-utils/test.utils';

// const timeUntilWarn: number = 1000 * 60 * 50; // 50 minutes
// const timeFromWarnToLogout: number = 1000 * 60 * 10; // 10 minutes
// const timeBeforeConsideredSleep: number = 1000 * 60 * 5; // 5 minutes

// jest.useFakeTimers();

describe('AutoLogout', () => {
  // afterEach(() => {
  //   jest.clearAllTimers();
  // });
  // increase timeout to 10 seconds for this test case
  // jest.setTimeout(10000);

  it('should not show warn modal with mouse activity', () => {
    jest.useFakeTimers();

    jest.advanceTimersByTime(1000 * 60 * 50); // 50 minutes
    act(() => {
      // simulate mouse activity
      window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      window.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    });
    expect(screen.queryByTestId('warn-modal')).toBeNull();

    jest.advanceTimersByTime(1000 * 60 * 10); // 10 minutes

    expect(screen.queryByTestId('warn-modal')).toBeNull();

    jest.useRealTimers();
  });

  it('should not show warn modal with keyboard activity', () => {
    jest.useFakeTimers();
    jest.advanceTimersByTime(1000 * 60 * 50); // 50 minutes
    act(() => {
      // simulate keyboard activity
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    });
    expect(screen.queryByTestId('warn-modal')).toBeNull();

    jest.advanceTimersByTime(1000 * 60 * 10); // 10 minutes

    expect(screen.queryByTestId('warn-modal')).toBeNull();

    jest.useRealTimers();
  });

  it('should show warn modal with no activity', async () => {
    const { container } = render(<AutoLogout
      logOut={jest.fn()}
      setAutoLogout={jest.fn()}
      timeUntilWarn={0}
      timeFromWarnToLogout={0}
      timeBeforeConsideredSleep={10000}
    />);

    await sleep(100);

    // expect(screen.queryByTestId('warn-modal')).toBeNull();

    await sleep(100);

    // act(() => {
    //   jest.advanceTimersByTime(1000 * 60 * 130); // 70 minutes
    // });

    screen.debug();
    // expect(screen.)

    expect(screen.queryByTestId('warn-modal')).not.toBeNull();
  });
});
