// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/extend-expect';

import {
  fireEvent, render, waitFor,
} from '@testing-library/react';
import React from 'react';

import PaginatedTableFooter from './PaginatedTableFooter';

describe('PaginatedTableFooter', () => {
  test('should render the current number of items per page', () => {
    const handleChangeItemsPerPageSpy = jest.fn();
    const changeCurrentPageSpy = jest.fn();
    const {
      getByLabelText,
    } = render(
      <PaginatedTableFooter numElements={10} paginationProps={{ dataSize: 10 }} handleChangeItemsPerPage={handleChangeItemsPerPageSpy} itemsPerPage={5} currentPage={0} changeCurrentPage={changeCurrentPageSpy} />,
    );

    const select = getByLabelText('Select page size');
    expect(select).toBeTruthy();

    const selectContainer = select.parentNode?.parentNode?.parentNode;
    expect(selectContainer).toBeTruthy();
    expect(selectContainer?.textContent).toEqual('5');
  });

  test('should render the new number of items per page after update and call handleChangeItemsPerPage', async () => {
    const handleChangeItemsPerPageSpy = jest.fn();
    const changeCurrentPageSpy = jest.fn();
    const {
      getByLabelText, getByTestId, getByText,
    } = render(
      <PaginatedTableFooter numElements={20} paginationProps={{ dataSize: 10 }} handleChangeItemsPerPage={handleChangeItemsPerPageSpy} itemsPerPage={5} currentPage={0} changeCurrentPage={changeCurrentPageSpy} />,
    );

    const select = getByLabelText('Select page size');
    expect(select).toBeInTheDocument();

    // @ts-ignore
    fireEvent.keyDown(getByTestId('page-size-select-container').firstChild, { keyCode: 40 });

    await waitFor(() => {
      const option = getByText('10');
      expect(option).toBeInTheDocument();
    });

    fireEvent.click(getByText('10'));

    await waitFor(() => {
      expect(handleChangeItemsPerPageSpy).toHaveBeenCalledTimes(1);
      expect(handleChangeItemsPerPageSpy).toHaveBeenCalledWith({ label: '10', value: '10' }, {
        action: 'select-option',
        name: undefined,
        option: undefined,
      });
    });
  });

  test('should render the current page number', () => {
    const handleChangeItemsPerPageSpy = jest.fn();
    const changeCurrentPageSpy = jest.fn();
    const {
      getByLabelText,
    } = render(
      <PaginatedTableFooter numElements={10} paginationProps={{ dataSize: 10 }} handleChangeItemsPerPage={handleChangeItemsPerPageSpy} itemsPerPage={5} currentPage={0} changeCurrentPage={changeCurrentPageSpy} />,
    );

    const pageSelector = getByLabelText('Page navigation');
    expect(pageSelector).toBeTruthy();
    expect(pageSelector).toHaveTextContent('12»');

    const activePage = getByLabelText('active');
    expect(activePage).toHaveTextContent('1');
  });

  test('should render the new page number after update and call handleChangeCurrentPage', async () => {
    const handleChangeItemsPerPageSpy = jest.fn();
    const changeCurrentPageSpy = jest.fn();
    const {
      getByLabelText,
    } = render(
      <PaginatedTableFooter numElements={10} paginationProps={{ dataSize: 10 }} handleChangeItemsPerPage={handleChangeItemsPerPageSpy} itemsPerPage={5} currentPage={0} changeCurrentPage={changeCurrentPageSpy} />,
    );

    // @ts-ignore
    fireEvent.click(getByLabelText('inactive').firstChild);

    await waitFor(() => {
      expect(changeCurrentPageSpy).toHaveBeenCalledTimes(1);
      // called with index, not page number
      expect(changeCurrentPageSpy).toHaveBeenCalledWith(1);
    });
  });
});
