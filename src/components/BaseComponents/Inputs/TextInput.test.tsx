import {
  fireEvent, render, waitFor,
} from '@testing-library/react';
import React from 'react';

import { TextInput } from '.';

describe('TextInput', () => {
  const label = 'Test Input Label';
  const name = 'test-input';

  beforeEach(() => {
    // @ts-ignore
    global.window.matchMedia = jest.fn(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));
  });
  test('should render the label and apply the name attribute', () => {
    const { getByLabelText, getByText } = render(<TextInput label={label} name={name} />);

    expect(getByText(label)).toBeInTheDocument();
    expect(getByText(label).getAttribute('for')).toEqual(name);

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByLabelText(label).getAttribute('name')).toEqual(name);
  });

  test('should render the placeholder text', () => {
    const placeholder = 'the placeholder';
    const { getByLabelText } = render(<TextInput label={label} name={name} placeholder={placeholder} />);

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByLabelText(label).getAttribute('placeholder')).toEqual(placeholder);
  });

  test('should render the required indicator', () => {
    const { getByLabelText } = render(<TextInput label={label} name={name} required />);

    expect(getByLabelText(label)).toBeInTheDocument();
    // TODO assert presence of required indicator (???)
  });

  test('should call onChange with the updated value', async () => {
    const onChange = jest.fn();
    const newValue = 'New Value';
    const { getByLabelText } = render(<TextInput label={label} name={name} onChange={onChange} />);

    expect(getByLabelText(label)).toBeInTheDocument();

    fireEvent.input(getByLabelText(label), { target: { value: newValue } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toBeCalledWith(newValue);
    });
  });

  test('should use the default value', async () => {
    const defaultValue = 'defaultValue';
    const { getByLabelText } = render(<TextInput label={label} name={name} defaultValue={defaultValue} />);

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByLabelText(label).getAttribute('value')).toEqual(defaultValue);
  });

  test('should use controlled value', async () => {
    const controlledValue = 'controlled value';
    const { getByLabelText } = render(<TextInput label={label} name={name} value={controlledValue} />);

    expect(getByLabelText(label)).toBeInTheDocument();
    fireEvent.input(getByLabelText(label), { target: { value: 'New Value' } });

    await waitFor(() => {
      expect(getByLabelText(label).getAttribute('value')).toEqual(controlledValue);
    });
  });
});
