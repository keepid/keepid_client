import React, { ReactElement, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory, {
  PaginationProvider,
  PaginationTotalStandalone,
} from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import '../../static/styles/App.scss';
import Modal from 'react-bootstrap/Modal';
import Select, { components } from 'react-select';
import SaveSVG from '../../static/images/checkmark.svg';
import EditSVG from '../../static/images/edit.svg';
import DeleteSVG from '../../static/images/delete.svg';
import ArrowSVG from '../../static/images/down-arrow.svg';
import getServerURL from '../../serverOverride';
import TablePageSelector from '../Base/TablePageSelector';

// This function controls formatting on the edit/save column (needed because of a glitch with the Edit/Save text)
interface FormatterProps {
    editRows: Set<number>,
    row: any,
    handleEdit: (event: any, row: any) => void,
    handleSave: (event: any, row: any) => void,
}

function EditFormatter(props: FormatterProps): React.ReactElement {
  const [editable, setEditable] = useState(false);

  const handleEdit = (e): void => {
    setEditable(true);
    props.handleEdit(e, props.row);
  };

  const handleSave = (e): void => {
    setEditable(false);
    props.handleSave(e, props.row);
  };

  return (
    <Button variant="link" className={editable ? 'save-text table-button action' : 'edit-text table-button action'} onClick={(e) => (editable ? handleSave(e) : handleEdit(e))}>
      <div className="row align-items-center">
        <img className="px-1 table-svg" src={editable ? SaveSVG : EditSVG} alt={editable ? "save" : "edit"}/>
        <div className="d-none d-sm-block">{ editable ? 'Save' : 'Edit' }</div>
      </div>

    </Button>
  );
}

interface TModalProps {
    row: any,
    handleClickClose: (event: any) => void,
    handleDelete: (event: any) => void,
}

function TModal(props: TModalProps): React.ReactElement {
  return (
    <Modal key="deleteRow" show>
      <Modal.Header>
        <Modal.Title>Delete Row</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row mb-3 mt-3">
          <div className="col">
            {`This is irreversible. Are you sure you want to delete all the data for row ${props.row.id}?`}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-danger" onClick={props.handleDelete}>Delete</button>
        <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={props.handleClickClose}>Cancel</button>
      </Modal.Footer>
    </Modal>
  );
}

const listOptions = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
];

interface Props {
    data: any[],
    columns: any[],
    canModify: boolean, // whether we can modify table at all
    cantEditCols: Set<number>, // set of row numbers that shouldn't be allowed to be edited
    modRoute: string,
    emptyInfo: {
      onPress: () => void,
      label: string,
      description: string,
    },
}

interface State {
    editRows: Set<number>,
    data: any[],
    showDeleteModal: boolean,
    rowToDelete: any,
    columns: any[],
    selectRows: Set<number>,
    currentPage: number,
    itemsPerPageSelected: any,
    numElements: number,
}

class Table extends React.Component<Props, State, {}> {
  constructor(props) {
    super(props);
    const { columns } = props;
    columns.forEach((col) => {
      col.formatter = this.inputFormatter;
      col.editorClasses = 'editor-input';
      col.style = (cell, row, rowIndex, colIndex) => {
        const { editRows } = this.state;
        return {
          textAlign: 'left',
          paddingLeft: editRows.has(row.id) ? '1rem' : '2rem',
          alignItems: 'center',
        };
      };
      if ('sort' in col && col.sort === true) {
        col.sortCaret = (order, column) => {
          let sortAlt = 'sort';
          let classDef = 'px-2 sort-svg';
          if (!order) {
            classDef += ' lighten';
          }
          else {
            sortAlt += ' ' + order;
            classDef += (order === 'desc') ? ' rotate180' : '';
          }
          return (<img className={classDef} src={ArrowSVG} alt={sortAlt}/>);
        }
      }
    });
    this.state = {
      editRows: new Set<number>(), // editRows represents the row IDs of rows currently being edited
      data: props.data,
      showDeleteModal: false,
      rowToDelete: null,
      columns,
      selectRows: new Set<number>(), // rowIDs of currently selected rows
      currentPage: 0,
      itemsPerPageSelected: listOptions[1],
      numElements: props.data.length,

    };
  }

    // row should appear as input if to be edited
    inputFormatter = (cell: any, row: any):ReactElement<{}> => {
      const { editRows } = this.state;
      if (editRows.has(row.id)) {
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
    }

    deleteFormatter = (cell: any, row: any) => (
      <Button variant="link" className="delete-text table-button action" onClick={(e) => this.handleTryDelete(e, row)}>
        <div className="row align-items-center">
          <img className="px-1 action-svg" src={DeleteSVG} alt="delete" />
          <div className="d-none d-sm-block">Delete</div>
        </div>
      </Button>
    )

    handleClickClose = (event: any):void => {
      this.setState({
        showDeleteModal: false,
        rowToDelete: null,
      });
    }

    handleTryDelete = (event: any, row: any):void => {
      event.preventDefault();
      this.setState({
        showDeleteModal: true,
        rowToDelete: row,
      });
    }

     handleDelete = (event: any, row: any): void => {
       event.preventDefault();
       const { modRoute } = this.props;
       const { editRows, data } = this.state;
       //** this section should move to success section
       editRows.delete(row.id);
       const index = data.findIndex((member) => member.id === row.id);
       const newData = data.slice();
       newData.splice(index, 1);
       this.setState({
         editRows,
         data: newData,
         showDeleteModal: false,
         rowToDelete: null,
       });
       //**

       // fetch(`${getServerURL()}${modRoute}`, {
       //     method: 'POST',
       //     credentials: 'include',
       //     body: JSON.stringify({
       //         mode: "delete", // or edit
       //         id: row.id,
       //       }),
       //     }).then((response) => response.json())
       //     .then((responseJSON) => {
       //         const responseObject = responseJSON;
       //         const { status } = responseObject;
       //         if (status === 'SUCCESS') {
       //             // TODO: move ** section into here
       //         }
       //         else {
       //             alert('Your edits did not save. Please refresh & try again.');
       //         }
       //     this.setState({
       //         showDeleteModal: false,
       //         rowToDelete: null
       //     });
       //     }).catch((error) => {
       //         alert(`Network Failure: ${error}`);
       //         this.setState({
       //             showDeleteModal: false,
       //             rowToDelete: null
       //         });
       //     });
     }

    handleEdit = (event: any, row: any): void => {
      event.preventDefault();
      const { editRows } = this.state;
      editRows.add(row.id);

      this.setState({
        editRows,
      });
    }

    handleSave = (event: any, row: any): void => {
      event.preventDefault();
      const { modRoute } = this.props;
      const { editRows, data } = this.state;
      //** this section should move to success section
      editRows.delete(row.id);
      this.setState({
        editRows,
      });
      //**
      // data in front-end is already updated
      const index = data.findIndex((member) => member.id === row.id);
      const member = { ...data[index] };

      // fetch(`${getServerURL()}${modRoute}`, {
      //     method: 'POST',
      //     credentials: 'include',
      //     body: JSON.stringify({
      //         mode: "edit", // or delete
      //         ...member,
      //       }),
      //     }).then((response) => response.json())
      //     .then((responseJSON) => {
      //         const responseObject = responseJSON;
      //         const { status } = responseObject;
      //         if (status === 'SUCCESS') {
      //             // TODO: move ** into here
      //         }
      //         else {
      //             alert('Your edits did not save. Please refresh & try again.');
      //         }
      //     }).catch((error) => {
      //         alert(`Network Failure: ${error}`);
      //     });
    }

    changeCurrentPage = (newCurrentPage: number): void => {
      this.setState({ currentPage: newCurrentPage });
    }

    handleChangeItemsPerPage = (itemsPerPageSelected: any): void => {
      this.setState({
        itemsPerPageSelected,
        currentPage: 0,
      });
    }

    //displayed when table is empty
    NoDataIndication = (): React.ReactElement => {
      const { emptyInfo } = this.props;
      return (
          <div className="empty-table d-flex flex-column justify-content-center">
            <div className="hi"><p>{`${emptyInfo.description}`}</p></div>
            <div className="hi">
              <button type="button" className="btn btn-primary" onClick={emptyInfo.onPress}>{`${emptyInfo.label}`}</button>
            </div> 
          </div>
      );
    }

    render() {
      const {
        columns,
        cantEditCols,
        canModify,
      } = this.props;

      const {
        data,
        editRows,
        showDeleteModal,
        rowToDelete,
        currentPage,
        itemsPerPageSelected,
        numElements,
        selectRows,
      } = this.state;
      
      const itemsPerPage = Number(itemsPerPageSelected.value);
      const lightPurple = '#E8E9FF';

      //custom results display for table
      const customTotal = (from, to, size) => (
        <span className="react-bootstrap-table-pagination-total">
          Showing
          {' '}
          { from }
          -
          { to }
          {' '}
          of
          {' '}
          { size }
          {' '}
          Results
        </span>
      );

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
      }
      // pagination options
      const paginationOption = {
        custom: true,
        totalSize: data.length,
        paginationTotalRenderer: customTotal,
        page: currentPage,
        pageStartIndex: 0,
        sizePerPage: itemsPerPage,
      };

      // edit options
      const cellEdit = cellEditFactory({
        mode: 'click',
        blurToSave: true,
        nonEditableCols: () => Array.from(cantEditCols),
        autoSelectText: true,
      });

      // this box is currently editable ONLY if in editRows (curr) & not in cols you're not allowed to edit
      const isEditable = (cell: any, row: any, rowIndex: number, colIndex: number) => {
        if (!canModify || !row) return false;
        const { editRows } = this.state;
        return editRows.has(row.id) && !cantEditCols.has(colIndex);
      };

      // add edit control for each column
      const columnsAll = columns.map((value, index) => {
        value.editable = isEditable;
        return value;
      });

      // add Edit column
      if (canModify) {
        columnsAll.push({
          dataField: 'edit',
          text: '',
          formatExtraData: this.state.editRows,
          formatter: (cell, row, rowIndex, formatExtraData) => <EditFormatter handleEdit={this.handleEdit} handleSave={this.handleSave} editRows={formatExtraData} row={row} />,
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
          formatter: this.deleteFormatter,
          headerStyle: () => ({
            width: '10%',
            minWidth: '8rem',
          }),
          editable: false,
          isDummyField: true,
        });
      }

      // selection customization
      const selectRow = {
        mode: 'checkbox',
        clickToSelect: false,
        headerColumnStyle: { width: '2.5rem' },
        selectionHeaderRenderer: ({ indeterminate, ...rest }) => (
          <div className="custom-control custom-checkbox mr-2">
          <input
            type="checkbox"
            className="custom-control-input"
            id={'selectAll'}
            ref={ (input) => {
              if (input) input.indeterminate = indeterminate;
            } }
            { ...rest }
          />
          <label className="custom-control-label" htmlFor={'selectAll'}></label>
        </div>),
        selectionRenderer: ({ mode, ...rest }) =>  {
          return (
          <div className="custom-control custom-checkbox mr-2">
            <input
              type={mode}
              className="custom-control-input"
              {...rest}
            />
            <label className="custom-control-label"></label>
          </div>
        )},
        onSelect: (row, isSelect, rowIndex, e) => {
          const { selectRows } = this.state;
          if (selectRows.has(row.id)) selectRows.delete(row.id);
          else selectRows.add(row.id);
          this.setState({
            selectRows,
          });
        },
        onSelectAll: (isSelect, rows, e) => {
          const { selectRows } = this.state;
          if (!isSelect) selectRows.clear();
          else rows.forEach((row) => { selectRows.add(row.id); });
          this.setState({
            selectRows,
          });
        },
      };

      // specifies design rules for row colors
      const rowClasses = (row, rowIndex) => {
        let classes = 'table-row';
        if (editRows.has(row.id) || selectRows.has(row.id)) {
          classes = ' table-edit-row';
        } 
        else if (data.length > 10 && rowIndex % 2 === 0) classes = ' table-zebra';
        return classes;
      };


      return (
        <PaginationProvider
          pagination={paginationFactory(paginationOption)}
        >
          {
                    ({
                      paginationProps,
                      paginationTableProps,
                    }) => (
                      <div>
                        <div className="row mx-4 mt-md-4">
                          <BootstrapTable
                            keyField="id"
                            data={data}
                            columns={columnsAll}
                            {...paginationTableProps}
                            cellEdit={cellEdit}
                            rowClasses={rowClasses}
                            selectRow={selectRow}
                            noDataIndication={() => <this.NoDataIndication />}
                            bodyClasses={(numElements === 0) ? 'empty-table' : ''}
                          />
                        </div>
                        {(numElements === 0) ? <div /> :
                          (<div className="row justify-content-end align-items-center">
                            <div className="col-md-3 py-3 d-flex justify-content-center">
                              <PaginationTotalStandalone
                                {...paginationProps}
                              />
                            </div>
                            <div className="col-md-3 form-inline py-2 d-flex justify-content-center">
                              <Select
                                options={listOptions}
                                autoFocus
                                closeMenuOnSelect={true}
                                onChange={this.handleChangeItemsPerPage}
                                value={itemsPerPageSelected}
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
                                changeCurrentPage={this.changeCurrentPage}
                              />
                            </div>
                          </div>
                          )}
                        {showDeleteModal ? <TModal row={rowToDelete} handleClickClose={this.handleClickClose} handleDelete={(e) => this.handleDelete(e, rowToDelete)} /> : null}
                      </div>
                    )
                }
        </PaginationProvider>
      );
    }
}

export default Table;
