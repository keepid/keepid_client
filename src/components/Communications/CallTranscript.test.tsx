/* @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import React from 'react';
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest';

import CallTranscript from './CallTranscript';

afterEach(cleanup);

describe('CallTranscript', () => {
  it('splits an inline transcript blob and aligns each participant', () => {
    render(
      <CallTranscript transcript="Caller: Hello. Caller: Hi. Staff: Hello, this is Steffen." />,
    );

    const turns = screen.getAllByRole('listitem');
    expect(turns).toHaveLength(3);
    expect(turns[0]).toHaveClass('left');
    expect(within(turns[0]).getByText('Hello.')).toBeInTheDocument();
    expect(turns[1]).toHaveClass('left');
    expect(within(turns[1]).getByText('Hi.')).toBeInTheDocument();
    expect(turns[2]).toHaveClass('right');
    expect(within(turns[2]).getByText('Hello, this is Steffen.')).toBeInTheDocument();
  });

  it('keeps a named staff speaker on the right', () => {
    render(<CallTranscript transcript="Caller: Can you help? Steffen: Yes, I can." />);

    const turns = screen.getAllByRole('listitem');
    expect(turns[0]).toHaveClass('left');
    expect(turns[1]).toHaveClass('right');
    expect(within(turns[1]).getByText('Steffen')).toBeInTheDocument();
  });
});
