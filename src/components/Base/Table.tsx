import React, { ReactElement, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory, {
  PaginationProvider,
  PaginationListStandalone,
  PaginationTotalStandalone,
  SizePerPageDropdownStandalone,
} from 'react-bootstrap-table2-paginator';
import cellEditFactory from 'react-bootstrap-table2-editor';
import Button from 'react-bootstrap/Button';
import '../../static/styles/App.scss';
import SaveSVG from '../../static/images/checkmark.svg';
import EditSVG from '../../static/images/edit.svg';
import DeleteSVG from '../../static/images/delete.svg';
import getServerURL from '../../serverOverride';
import Modal from 'react-bootstrap/Modal';

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
    }
    
    return (
        <Button variant='link' className={ editable ? "save-text table-button" : "edit-text table-button"} onClick={ (e) => editable ? handleSave(e) : handleEdit(e) }>
            <div className="row align-items-center">
                <img className="px-1" src={editable ? SaveSVG : EditSVG}/>
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
  <Modal key="deleteRow" show={true}>
    <Modal.Body>
      <div className="row mb-3 mt-3">
        <div className="col">
            {`This is irreversible. Are you sure you want to delete row ${props.row.id}?`}
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
        <button type="button" className="btn btn-danger" onClick={props.handleDelete}>Delete</button>
        <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={props.handleClickClose}>Cancel</button>  
    </Modal.Footer>
  </Modal>
)
}

interface Props {
    data: any[],
    columns: any[],
    canModify: boolean, // whether we can modify table at all
    cantEditCols: Set<number>, //set of row numbers that shouldn't be allowed to be edited
    modRoute: string,

}

interface State {
    editRows: Set<number>,
    data: any[],
    showDeleteModal: boolean,
    rowToDelete: any,
    columns: any[],
    selectRows: Set<number>,
}

class Table extends React.Component<Props, State, {}> {

    constructor(props) {
        super(props);
        const columns = props.columns;
        columns.forEach(col => {
            col.formatter = this.InputFormatter;
            col.editorClasses = "editor-input";
            col.style = (cell, row, rowIndex, colIndex) => {
                const { editRows } = this.state;
                return { "text-align": 'left',
                          "padding-left": editRows.has(row.id) ? "1rem" : "2rem",
                          "align-items": "center",
                }
            };
        });
        this.state = {
          editRows: new Set<number>(), // editRows represents the row IDs of rows currently being edited
          data: props.data,
          showDeleteModal: false,
          rowToDelete: null,
          columns: columns,
          selectRows: new Set<number>(), //rowIDs of currently selected rows?
        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleTryDelete = this.handleTryDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.deleteFormatter = this.deleteFormatter.bind(this);
    }
    
    InputFormatter = (cell: any, row: any):ReactElement<{}> => {
        const { editRows } = this.state;
        if (editRows.has(row.id)) {
            return (
              <input
                type="text"
                className={`form-control form-purple editor-input`}
                value={cell}
                readOnly
                 />
            );
        }
        else return cell;
    }
    handleClickClose = (event: any):void => {
        this.setState({showDeleteModal: false,
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


     // handles what happens when delete button clicked
     handleDelete = (event: any, row: any): void => {
        event.preventDefault();
        const { modRoute } = this.props;
        const { editRows, data } = this.state;
        //**
        editRows.delete(row.id);
        const index = data.findIndex((member) => member.id === row.id);
        const newData = data.slice();
        newData.splice(index, 1);
        this.setState({
            editRows,
            data: newData,
            showDeleteModal: false,
            rowToDelete: null
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

    // handles what happens when edit button clicked
    handleEdit = (event: any, row: any): void => {
        event.preventDefault();
        const { editRows } = this.state;
        editRows.add(row.id);

        this.setState({
            editRows: editRows,
        })
    }

    // handles what happens when save button clicked
    handleSave = (event: any, row: any): void => {
        event.preventDefault();
        const { modRoute } = this.props;
        const { editRows, data } = this.state;
        //**
        editRows.delete(row.id);
        this.setState({
            editRows: editRows,
        });
        //**
        // data in front-end is already updated
        const index = data.findIndex((member) => member.id === row.id);
        const member = { ...data[index] };
        console.log(Object.entries(member));
        
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


    // delete button React component
    deleteFormatter = (cell: any, row: any) => {
        return (
            <Button variant='link' className="delete-text table-button" onClick = {(e) => this.handleTryDelete(e, row)} >
            <div className="row align-items-center">
                <img className="px-1" src={DeleteSVG}/>
                <div className="d-none d-sm-block">Delete</div> 
            </div>
            </Button>
        )
    }

    render() {
        const {
            columns,
            cantEditCols,
            canModify,
        } = this.props;

        const {
            showDeleteModal,
            rowToDelete,
        } = this.state;
        // pagination option
        const paginationOption = {
            custom: true,
            totalSize: this.state.data.length,
        };

        // edit options
        const cellEdit = cellEditFactory({
            mode: 'click',
            blurToSave: true,
            nonEditableCols: () => Array.from(cantEditCols),
            autoSelectText: true,
        });

        // controls editing
        // this box is currently editable ONLY if in editRows (curr) & not in cols you're not allowed to edit
        const isEditable = (cell: any, row: any, rowIndex: number, colIndex: number) => {
            if (!canModify) return false;
            const { editRows } = this.state;
            return editRows.has(row.id) && !cantEditCols.has(colIndex);
        }

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
            formatter: (cell, row, rowIndex, formatExtraData) => <EditFormatter handleEdit={this.handleEdit} handleSave={this.handleSave} editRows={formatExtraData} row={row}/>, //this.editFormatter(cell, row, rowIndex, formatExtraData),
            headerStyle: () => {
                return { width: "10%",
                        minWidth: "8rem"
                };
            },
            editable: false,
            isDummyField: true,
        });

        // add Delete column
        columnsAll.push({
            dataField: 'delete',
            text: '',
            formatter: this.deleteFormatter,
            headerStyle: () => {
                return { width: "10%",
                        minWidth: "8rem"
                };
            },
            editable: false,
            isDummyField: true,
        });
        }
        const selectRow = {
            mode: 'checkbox',
            clickToSelect: false,
            bgColor: '#E8E9FF',
            onSelect: (row, isSelect, rowIndex, e) => {
                const { selectRows } = this.state;
                if (selectRows.has(row.id))
                    selectRows.delete(row.id);
                else selectRows.add(row.id);
                console.log("Selected: " + selectRows.forEach(x => {console.log(x)}));
                this.setState({
                    selectRows: selectRows,
                });
            },
            onSelectAll: (isSelect, rows, e) => {
            const { selectRows } = this.state;
            if (selectRows.size !== 0)
                selectRows.clear();
            else
                rows.forEach((row) => {selectRows.add(row.id)});
            console.log("Select: " + selectRows.forEach(x => {console.log(x)}));
            this.setState({
                selectRows: selectRows,
            });
            }
        };
        const rowClasses = (row, rowIndex) => {
            const { editRows, data } = this.state;
            var classes = 'table-row';
            if (editRows.has(row.id)) {
                classes += ' table-edit-row'; 
            }
            else if (data.length > 10 && rowIndex%2 === 0)
                classes += ' table-zebra';
                return classes;
        };
        
        return (
            <PaginationProvider
                pagination={paginationFactory(paginationOption)}
            >
                { 
                    ({
                        paginationProps, // some of the pagination stuff should be passed in as props
                        paginationTableProps,
                    }) => (
                    <div>
                        <BootstrapTable
                            keyField="id"
                            data={this.state.data}
                            columns={columnsAll}
                            {...paginationTableProps}
                            cellEdit={ cellEdit }
                            rowClasses={ rowClasses }
                            selectRow={ selectRow }
                        />
                        <SizePerPageDropdownStandalone
                        {...paginationProps}
                        />
                        <PaginationTotalStandalone
                        {...paginationProps}
                        />
                        <PaginationListStandalone
                        {...paginationProps}
                        />
                        {showDeleteModal ? <TModal row={rowToDelete} handleClickClose={this.handleClickClose} handleDelete={(e) => this.handleDelete(e, rowToDelete)} /> : null}
                    </div>
                    )
                }
            </PaginationProvider>
        );
    }
}

export default Table;
