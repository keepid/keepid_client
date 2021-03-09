// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import {
  fireEvent, queries, queryHelpers, render, waitFor,
} from '@testing-library/react';
import React from 'react';

import { SelectInput } from '.';

const queryByNameAttributeQuery = (container, id, options) => queryHelpers.queryByAttribute('name', container, id, options);

describe('SelectInput', () => {
  const label = 'Test Input Label';
  const name = 'test-input';
  const options = new Array(20).fill('').map((i, idx) => ({ label: `Option ${idx}`, value: `option-val-${idx}` }));

  test('should render the label and apply the name attribute', () => {
    const { getByLabelText, getByText, queryByNameAttribute } = render(
      <SelectInput label={label} name={name} options={options} />,
      { queries: { ...queries, queryByNameAttribute: queryByNameAttributeQuery } },
    );

    expect(getByText(label)).toBeInTheDocument();
    expect(getByText(label).getAttribute('for')).toEqual(name);

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(queryByNameAttribute(name)).toBeInTheDocument();
  });

  test('should render options in list on click and call onChange with selected value', async () => {
    const onChange = jest.fn();
    const { getByLabelText, getByText } = render(
      <SelectInput label={label} name={name} options={options} onChange={onChange} />,
      { queries: { ...queries, queryByNameAttribute: queryByNameAttributeQuery } },
    );

    // for some reason clicking doesn't work in tests
    fireEvent.keyDown(getByLabelText(label), { keyCode: 40 });

    await waitFor(() => {
      options.forEach((o) => expect(getByText(o.label)).toBeInTheDocument());
    });

    fireEvent.click(getByText(options[4].label));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(options[4]);
    });
  });

  test('should render the placeholder', () => {
    const placeholder = 'the placeholder';
    const { getByLabelText, getByText } = render(
      <SelectInput label={label} name={name} options={options} placeholder={placeholder} />,
      { queries: { ...queries, queryByNameAttribute: queryByNameAttributeQuery } },
    );

    expect(getByLabelText(label)).toBeInTheDocument();
    expect(getByText(placeholder)).toBeInTheDocument();
  });

  test('should render the default value', () => {
    const defaultValue = options[3].value;
    const { queryByNameAttribute } = render(
      <SelectInput label={label} name={name} options={options} defaultValue={defaultValue} />,
      { queries: { ...queries, queryByNameAttribute: queryByNameAttributeQuery } },
    );

    const input = queryByNameAttribute(name);
    expect(input).toBeInTheDocument();
    expect(input?.getAttribute('value')).toEqual(options[3].value);
  });
});
