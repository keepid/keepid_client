/* eslint-disable no-param-reassign */
import '../../../static/styles/App.scss';

import classNames from 'classnames';
import React, { ReactElement, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';

import ArrowSVG from '../../../static/images/down-arrow.svg';
import EditFormatter from './EditFormatter';
import TModal from './TModal';

export const defaultProps = {
  canModify: false,
  canSelect: false,
  cantEditCols: new Set<number>(),
  onEditSave: () => {},
  onDelete: () => {},
};

const formatColumns = (
  columns,
  canModify,
  editRows,
  cantEditCols,
  deleteFormatter,
  handleEdit,
  handleSave,
) => {
  // add edit control for each column
  const columnsAll = columns.map((value) => {
    value.editable = (
      cell: any,
      row: any,
      rowIndex: number,
      colIndex: number,
    ) =>
      canModify && !!row && editRows.has(row.id) && !cantEditCols.has(colIndex);

    return value;
  });

  // add Edit column
  if (canModify) {
    columnsAll.push({
      dataField: 'edit',
      text: '',
      formatExtraData: editRows,
      formatter: (cell, row) => (
        <EditFormatter
          handleEdit={handleEdit}
          handleSave={handleSave}
          row={row}
        />
      ),
      headerStyle: () => ({
        width: '10%',
        minWidth: '8rem',
      }),
      editable: false,
      isDummyField: true,
    });

    // add Delete column
    columnsAll.push({
      dataField: 'delete',
      text: '',
      formatter: deleteFormatter,
      headerStyle: () => ({
        width: '10%',
        minWidth: '8rem',
      }),
      editable: false,
      isDummyField: true,
    });
  }

  return columnsAll;
};

const constructSelectRowConfiguration = (
  canSelect: boolean | 'single' | undefined,
  selectedRows: Set<number>,
  setSelectedRows: (a: Set<number>) => void,
) => ({
  hideSelectColumn: !canSelect,
  mode: canSelect === 'single' ? 'radio' : 'checkbox',
  clickToSelect: false,
  headerColumnStyle: { width: '2.5rem' },
  // eslint-disable-next-line react/prop-types
  selectionHeaderRenderer: ({ indeterminate, mode, checked }) =>
    canSelect === true ? (
      <div className="custom-control custom-checkbox mr-2">
        <input
          type={mode}
          className="custom-control-input"
          id="selectAll"
          ref={(input) => {
            if (input) input.indeterminate = indeterminate;
          }}
          checked={checked}
          onChange={() => {}}
        />
        <label className="custom-control-label" htmlFor="selectAll" />
      </div>
    ) : null,
  selectionRenderer: ({ mode, checked, disabled, ...rest }) => (
    <div className="custom-control custom-checkbox mr-2">
      <input
        type={mode}
        className="custom-control-input"
        checked={checked}
        disabled={disabled}
        {...rest}
      />
      <label className="custom-control-label" />
    </div>
  ),
  onSelect: (row, isSelect, rowIndex, e) => {
    if (canSelect === 'single' && isSelect) {
      console.log('\n\nasdf2', canSelect, row, isSelect, rowIndex, '\n\n');
      selectedRows.clear();
    }

    // eslint-disable-next-line no-unused-expressions
    selectedRows.has(row.id)
      ? selectedRows.delete(row.id)
      : selectedRows.add(row.id);
    setSelectedRows(new Set(selectedRows));
  },
  onSelectAll: (isSelect, rows, e) => {
    // eslint-disable-next-line no-unused-expressions
    isSelect
      ? rows.forEach((r) => selectedRows.add(r.id))
      : selectedRows.clear();
    setSelectedRows(new Set(selectedRows));
  },
});

const createDeleteFormatter = (handleTryDelete) => (cell: any, row: any) => (
  <Button
    variant="link"
    className="delete-text table-button action"
    onClick={(e) => handleTryDelete(e, row)}
  >
    <div className="row align-items-center">
      {/* <img className="px-1 action-svg" src={DeleteSVG} alt="delete" /> */}
      <div className="d-none d-sm-block">Delete</div>
    </div>
  </Button>
);

const createCellEditFactory = (cantEditCols: Set<number>) =>
  cellEditFactory({
    mode: 'click',
    blurToSave: true,
    nonEditableCols: () => Array.from(cantEditCols),
    autoSelectText: true,
  });

type Formatter = (
  cell: any,
  row: any,
  rowIndex: number,
  formatExtraData: any
) => JSX.Element | string;
type Column = {
  // The name of the property on each Row object to be represented by this Column
  dataField: string;
  // The display name of the Column rendered in the table
  text: string;
  // Method used to render the data represented by this Column
  formatter?: Formatter;
  // Custom classes to apply on edit
  editorClasses?: string;
  // Method to compute custom styling for cells
  style?: (cell: any, row: any, rowIndex: number, colIndex: number) => object;
  // Boolean indicating whether sorting is supported for the column
  sort?: boolean;
  // Method to customize the sort caret
  sortCaret?: (order: 'asc' | 'desc' | undefined, column: Column) => any;
  // Method to perform sorting; if unspecified, alphabetical sorting will be used
  sortFunc?: (
    a: any,
    b: any,
    order: 'asc' | 'desc',
    dataField: string,
    rowA: any,
    rowB: any
  ) => any;
};

export interface TableProps extends NoDataIndicationProps {
  // An array of data, where each item represents a row in the Table and should contain properties corresponding to the Columns provided
  data: any[];
  // An array of Columns
  columns: Column[];
  // Boolean indicating whether this Table can be modified at all
  canModify?: boolean;
  // Boolean indicating whether rows in this Table can be selected
  canSelect?: boolean | 'single';
  // Method called with the ID(s) of the selected row(s)
  onSelect?: (rowIds: string | string[]) => void;
  // Set containing the indexes of Columns containing non-editable data
  cantEditCols?: Set<number>;
  // Method called upon row deletion with the row ID
  onDelete?: (id: any) => void;
  // Method called upon Row modification save
  onEditSave?: (row: any) => void;
  // Default sort settings
  defaultSorted?: { dataField: string; order: 'asc' | 'desc' }[];
}

/**
 * Base Table body component, without pagination
 */
export const Table = ({
  canModify,
  canSelect,
  onSelect,
  cantEditCols: cantEditColsProp,
  columns,
  data: dataProp,
  emptyInfo,
  onDelete,
  onEditSave,
  ...rest
}: TableProps) => {
  // Boolean indicating whether the `columns`
  const [initialized, setInitialized] = useState(false);
  const [rowsBeingEdited, setRowsBeingEdited] = useState(new Set<number>());
  const [selectedRows, setSelectedRows] = useState(new Set<any>());
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [data, setData] = useState<any[]>(dataProp || []);

  useEffect(() => {
    if (onSelect) {
      onSelect(Array.from(selectedRows));
    }
  }, [selectedRows]);

  const cantEditCols =
    cantEditColsProp instanceof Set ? cantEditColsProp : new Set<number>();

  const inputFormatter = (cell: any, row: any): ReactElement<{}> => {
    if (rowsBeingEdited.has(row.id)) {
      return (
        <input
          type="text"
          className="form-control form-purple editor-input"
          value={cell}
          readOnly
        />
      );
    }
    return cell;
  };

  // Update data when prop value changes
  useEffect(() => {
    setData(dataProp);
  }, [dataProp]);

  useEffect(() => {
    if (!initialized) {
      columns.forEach((col) => {
        col.formatter = col.formatter || inputFormatter;
        col.editorClasses = 'editor-input';
        col.style = (cell, row) => ({
          textAlign: 'left',
          paddingLeft: rowsBeingEdited.has(row.id) ? '1rem' : '2rem',
          alignItems: 'center',
        });
        if (col.sort === true) {
          col.sortCaret = (order) => {
            let sortAlt = 'sort';
            let classDef = 'px-2 sort-svg';
            if (!order) {
              classDef += ' lighten';
            } else {
              sortAlt += ` ${order}`;
              classDef += order === 'desc' ? ' rotate180' : '';
            }
            return <img className={classDef} src={ArrowSVG} alt={sortAlt} />;
          };
        }
      });
      setInitialized(true);
    }
  });

  const handleEdit = (e, row) => {
    e.preventDefault();
    rowsBeingEdited.add(row.id);
    setRowsBeingEdited(new Set(rowsBeingEdited));
  };

  const handleSave = (e, row) => {
    e.preventDefault();
    rowsBeingEdited.delete(row.id);
    setRowsBeingEdited(new Set(rowsBeingEdited));
    if (onEditSave) {
      onEditSave(row);
    }
  };

  const handleTryDelete = (e, row) => {
    e.preventDefault();
    setRowToDelete(row);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    const { id } = rowToDelete;

    // update `data` state
    const index = data.findIndex((member) => member.id === id);
    const newData = data.slice();
    newData.splice(index, 1);
    setData(newData);

    // update `editRows` state
    rowsBeingEdited.delete(id);
    setRowsBeingEdited(new Set(rowsBeingEdited));

    // clear out `rowToDelete`
    setRowToDelete(null);

    // call `onDelete` method passed via props
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleClickClose = (e) => {
    e.preventDefault();
    setRowToDelete(null);
  };

  // specifies design rules for row colors
  const rowClasses = (row, rowIndex) =>
    classNames('table-row', {
      'table-edit-row': rowsBeingEdited.has(row.id) || selectedRows.has(row.id),
      'table-zebra': data.length > 10 && rowIndex % 2 === 0,
    });

  const tableColumns = formatColumns(
    columns,
    canModify,
    rowsBeingEdited,
    cantEditCols,
    createDeleteFormatter(handleTryDelete),
    handleEdit,
    handleSave,
  );

  return (
    <>
      <BootstrapTable
        keyField="id"
        data={data}
        columns={tableColumns}
        {...rest}
        cellEdit={createCellEditFactory(cantEditCols)}
        rowClasses={rowClasses}
        selectRow={constructSelectRowConfiguration(
          canSelect,
          selectedRows,
          setSelectedRows,
        )}
        noDataIndication={() => <NoDataIndication emptyInfo={emptyInfo} />}
        bodyClasses={data.length === 0 ? 'empty-table' : ''}
      />
      {rowToDelete ? (
        <TModal
          row={rowToDelete}
          handleClickClose={handleClickClose}
          handleDelete={handleDelete}
        />
      ) : null}
    </>
  );
};

Table.defaultProps = defaultProps;

interface NoDataIndicationProps {
  emptyInfo: {
    onPress?: () => void;
    label?: string;
    description: string;
  };
}

/**
 * Component rendered when no data provided to Table
 */
const NoDataIndication = ({
  emptyInfo,
}: NoDataIndicationProps): React.ReactElement => (
  <div className="empty-table d-flex flex-column justify-content-center">
    <div>
      <p>{`${emptyInfo.description}`}</p>
    </div>
    {emptyInfo.label && emptyInfo.onPress ? (
      <div className="hi">
        <button
          type="button"
          className="btn btn-primary"
          onClick={emptyInfo.onPress}
        >
          {`${emptyInfo.label}`}
        </button>
      </div>
    ) : null}
  </div>
);

export default Table;
