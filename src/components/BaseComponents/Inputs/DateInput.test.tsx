// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import { DateInput } from '.';

describe('DateInput', () => {
  const label = 'Test Input Label';
  const name = 'test-input';

  test('should render the label and apply the name attribute', () => {
    const { getByLabelText, getByText } = render(<DateInput label={label} name={name} />);

    expect(getByText(label)).toBeInTheDocument();
    expect(getByText(label).getAttribute('for')).toEqual(name);

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByLabelText(label).getAttribute('name')).toEqual(name);
  });

  test('should show date picker on click and call onChange with selected value', async () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText, rerender } = render(
      <DateInput label={label} name={name} onChange={onChange} value={new Date()} />,
    );

    fireEvent.click(getByLabelText(label));

    await waitFor(() => {
      Array(28).forEach((_, idx) => expect(getByText(idx)).toBeInTheDocument());
    });

    fireEvent.click(getByText(10));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    const args = onChange.mock.calls[0];
    expect(args[0]).toBeInstanceOf(Date);
    expect(args[0].getFullYear()).toEqual(new Date().getFullYear());
    expect(args[0].getMonth()).toEqual(new Date().getMonth());
    expect(args[0].getDate()).toEqual(10);

    rerender(<DateInput label={label} name={name} onChange={onChange} value={args[0]} />);
    const month = new Date().getUTCMonth();

    await waitFor(() => {
      expect(getByLabelText(label).getAttribute('value')).toEqual(
        [(month < 10 ? '0' : '') + month, 10, new Date().getUTCFullYear()].join('/'),
      );
    });
  });

  test('should render time selection on click and call onChange with selected value', async () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText } = render(
      <DateInput label={label} name={name} onChange={onChange} showTimeSelect />,
    );

    fireEvent.click(getByLabelText(label));

    await waitFor(() => {
      expect(getByText('Time')).toBeInTheDocument();
    });

    fireEvent.click(getByText('10:30 AM'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      const expectedDate = new Date();
      expectedDate.setHours(10);
      expectedDate.setMinutes(30);
      const args = onChange.mock.calls[0];
      expect(args[0]).toBeInstanceOf(Date);
      expect(args[0].getFullYear()).toEqual(expectedDate.getFullYear());
      expect(args[0].getMonth()).toEqual(expectedDate.getMonth());
      expect(args[0].getDate()).toEqual(expectedDate.getDate());
      expect(args[0].getUTCHours()).toEqual(expectedDate.getUTCHours());
      expect(args[0].getUTCMinutes()).toEqual(expectedDate.getUTCMinutes());
    });
  });

  test('should render the placeholder', () => {
    const placeholder = 'the placeholder';
    const { getByLabelText } = render(<DateInput label={label} name={name} placeholder={placeholder} />);

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByLabelText(label).getAttribute('placeholder')).toEqual(placeholder);
  });

  test('should render the default value', () => {
    const defaultValue = '01/01/2015';
    const { getByLabelText } = render(
      <DateInput label={label} name={name} defaultValue={new Date(2015, 0, 1, 12)} />,
    );

    const input = getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input?.getAttribute('value')).toEqual(defaultValue);
  });
});
