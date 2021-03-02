import React from 'react';
import { PaginationTotalStandalone } from 'react-bootstrap-table2-paginator';
import Select from 'react-select';

import TablePageSelector from './TablePageSelector';

const listOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

interface PaginatedTableFooterProps {
  numElements: number;
  paginationProps: any;
  handleChangeItemsPerPage: (e, i) => void;
  itemsPerPage: number;
  currentPage: number;
  changeCurrentPage: (e, i) => void;

}

const PaginatedTableFooter = ({
  numElements,
  itemsPerPage,
  handleChangeItemsPerPage,
  paginationProps,
  currentPage,
  changeCurrentPage,
}: PaginatedTableFooterProps) => {
  const lightPurple = '#E8E9FF';

  // styles for results per page Select element
  const selectStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? lightPurple : 'white',
      color: 'black',
    }),
    container: (provided) => ({
      ...provided,
      minWidth: (itemsPerPage === 5) ? '2.5rem' : '4.5rem',
    }),
  };

  return (numElements === 0) ? <div />
    : (
      <div className="row justify-content-center align-items-center">
        <div className="col-md-3 py-3 d-flex justify-content-center">
          <PaginationTotalStandalone
            {...paginationProps}
          />
        </div>
        <div className="col-md-3 form-inline py-2 d-flex justify-content-center" data-testid="page-size-select-container">
          <Select
            aria-label="Select page size"
            options={listOptions}
            closeMenuOnSelect
            onChange={handleChangeItemsPerPage}
            value={listOptions.find((i) => i.value === `${itemsPerPage}`)}
            menuPlacement="top"
            styles={selectStyles}
          />
          {' '}
          <p className="my-auto ml-2">
            {' '}
            results per page
          </p>
        </div>
        <div className="col-md-3 mx-md-4 py-2 my-1 d-flex justify-content-center">
          <TablePageSelector
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            numElements={numElements}
            changeCurrentPage={changeCurrentPage}
          />
        </div>
      </div>
    );
};

export default PaginatedTableFooter;
