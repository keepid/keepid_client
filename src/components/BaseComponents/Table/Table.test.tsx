import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import Table from '.';

describe('Table', () => {
  const columns = [{
    dataField: 'col-1',
    text: 'First Column',
    sort: true,
  }, {
    dataField: 'col-2',
    text: 'Second Column',
  }];

  const generateRow = (idx: number) => ({ id: `${idx}`, 'col-1': `${idx}A`, 'col-2': `${idx}B` });

  const data = [generateRow(1), generateRow(2)];

  const assertRowRendered = (row, queryByText) => {
    Object.keys(row).filter((k) => k !== 'id').forEach((k) => expect(queryByText(row[k])).toBeInTheDocument());
  };

  const assertRowNotRendered = (row, queryByText) => {
    Object.keys(row).filter((k) => k !== 'id').forEach((k) => expect(queryByText(row[k])).toBeFalsy());
  };

  test('should render data as rows', () => {
    const { getByText } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

    columns.forEach((c) => expect(getByText(c.text)).toBeInTheDocument());
    data.forEach((row) => assertRowRendered(row, getByText));
  });

  test('should re-render if data prop updated', () => {
    const { getByText, rerender } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

    const newData = [generateRow(1), generateRow(2), generateRow(3), generateRow(4)];
    rerender(<Table data={newData} columns={columns} emptyInfo={{ description: 'no data' }} />);

    columns.forEach((c) => expect(getByText(c.text)).toBeInTheDocument());
    newData.forEach((row) => assertRowRendered(row, getByText));
  });

  test('should sort by column value', async () => {
    const data = new Array(6).fill('').map((o, idx) => generateRow(idx));
    const {
      getByText, queryByText,
    } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

    await waitFor(() => {
      data.slice(0, 4).forEach((row) => assertRowRendered(row, queryByText));
      assertRowNotRendered(data[5], queryByText);
    });

    // @ts-ignore
    fireEvent.click(getByText(columns[0].text));

    await waitFor(() => {
      data.slice(1, 5).forEach((row) => assertRowRendered(row, queryByText));
      assertRowNotRendered(data[0], queryByText);
    });
  });

  test('should render empty data message if no data present', () => {
    const {
      getByText,
    } = render(<Table data={[]} columns={columns} emptyInfo={{ description: 'no data' }} />);

    expect(getByText('no data')).toBeInTheDocument();
  });

  describe('Pagination', () => {
    test('should paginate with a page size of 5 by default', () => {
      const data = new Array(20).fill('').map((o, idx) => generateRow(idx));
      const { getByText, queryByText } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

      data.slice(0, 4).forEach((row) => assertRowRendered(row, getByText));
      data.slice(5).forEach((row) => assertRowNotRendered(row, queryByText));
    });

    test('should respond to change in page size', async () => {
      const data = new Array(20).fill('').map((o, idx) => generateRow(idx));
      const {
        getByText, queryByText, getByTestId,
      } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

      // @ts-ignore
      fireEvent.keyDown(getByTestId('page-size-select-container').firstChild, { keyCode: 40 });

      await waitFor(() => {
        const option = getByText('10');
        expect(option).toBeInTheDocument();
      });

      fireEvent.click(getByText('10'));

      await waitFor(() => {
        data.slice(0, 9).forEach((row) => assertRowRendered(row, getByText));
        data.slice(10).forEach((row) => assertRowNotRendered(row, queryByText));
      });
    });
    test('should respond to change in page selected', async () => {
      const data = new Array(20).fill('').map((o, idx) => generateRow(idx));
      const {
        getByText, queryByText, getAllByLabelText,
      } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

      // @ts-ignore
      fireEvent.click(getAllByLabelText('inactive')[0].firstChild);

      await waitFor(() => {
        data.slice(0, 4).forEach((row) => assertRowNotRendered(row, queryByText));
        data.slice(5, 9).forEach((row) => assertRowRendered(row, getByText));
        data.slice(10).forEach((row) => assertRowNotRendered(row, queryByText));
      });
    });

    test('should not crash if only row on page is removed', async () => {
      const data = new Array(6).fill('').map((o, idx) => generateRow(idx));
      const {
        getByText, queryByText, getAllByLabelText, rerender,
      } = render(<Table data={data} columns={columns} emptyInfo={{ description: 'no data' }} />);

      // @ts-ignore
      fireEvent.click(getAllByLabelText('inactive')[0].firstChild);

      await waitFor(() => {
        data.slice(0, 4).forEach((row) => assertRowNotRendered(row, queryByText));
        assertRowRendered(data[5], getByText);
      });

      rerender(<Table data={data.slice(0, 4)} columns={columns} emptyInfo={{ description: 'no data' }} />);

      await waitFor(() => {
        data.slice(0, 4).forEach((row) => assertRowRendered(row, queryByText));
      });
    });
  });
});
