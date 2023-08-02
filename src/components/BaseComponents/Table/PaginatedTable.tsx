/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import paginationFactory, {
  PaginationProvider,
} from 'react-bootstrap-table2-paginator';

import PaginatedTableFooter from './PaginatedTableFooter';
import Table, { defaultProps, TableProps } from './Table';

// custom results display for table
const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    {`Showing ${from}-${to} of ${size} Results`}
  </span>
);

interface PaginatedTableProps extends TableProps {}

/**
 * Wrapper providing pagination to the base Table component
 */
function PaginatedTable({ data, ...props }: PaginatedTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  data = data || [];

  if (itemsPerPage * currentPage >= data.length && currentPage > 0) {
    setCurrentPage(currentPage - 1);
    return null;
  }

  return (
    <PaginationProvider
      pagination={paginationFactory({
        custom: true,
        totalSize: data.length,
        paginationTotalRenderer: customTotal,
        page: currentPage,
        pageStartIndex: 0,
        sizePerPage: itemsPerPage,
      })}
    >
      {({ paginationProps, paginationTableProps }) => (
        <div>
          <div className="row mx-4 mt-md-4">
            <Table data={data} {...props} {...paginationTableProps} />
          </div>
          <PaginatedTableFooter
            changeCurrentPage={setCurrentPage}
            currentPage={currentPage}
            handleChangeItemsPerPage={(i) => {
              setItemsPerPage(Number(i.value));
              setCurrentPage(0);
            }}
            itemsPerPage={itemsPerPage}
            numElements={data.length}
            paginationProps={paginationProps}
          />
        </div>
      )}
    </PaginationProvider>
  );
}

PaginatedTable.defaultProps = defaultProps;

export default PaginatedTable;
