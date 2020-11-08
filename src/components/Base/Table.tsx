import React, { useState } from 'react';
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

// This function controls formatting on the edit/save column (needed because of a glitch with the Edit/Save text)
interface FormatterProps {
    editRows: Set<number>,
    row: any,
    rowIndex: number,
    handleEdit: (event: any, row: any) => void,
    //handleSave: (event: any, row: any) => void, 
    handleSave: (event: any, row: any, rowIndex: number) => Promise<void>,
}

function EditFormatter(props: FormatterProps): React.ReactElement {
    const [editable, setEditable] = useState(false);

    const handleEdit = (e): void => {
        console.log('handleEdit');
        setEditable(true);
        props.handleEdit(e, props.row);
    };

    const handleSave = (e): void => {
        console.log('handleSave');
        setEditable(false);
        props.handleSave(e, props.row, props.rowIndex);
    }
    
    return (
        <Button variant='link' className={ editable ? "save-text" : "edit-text"} onClick={ (e) => editable ? handleSave(e) : handleEdit(e) }>
            <div className="row align-items-center">
                <img className="px-1 save-text" src={editable ? SaveSVG : EditSVG}/>
                <div>{ editable ? 'Save' : 'Edit' }</div> 
            </div>
           
        </Button>
    );
}

interface Props {
    data: any[],
    columns: any[],
    canModify: boolean, // whether we can modify table at all
    cantEditCols: Set<number>, //set of row numbers that shouldn't be allowed to be edited
    route: string,

}

interface State {
    editRows: Set<number>,
    data: any[],
}

class Table extends React.Component<Props, State, {}> {

    constructor(props) {
        super(props);
        this.state = {
          editRows: new Set<number>(), // editRows represents the row IDs of rows currently being edited
          data: props.data,
        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.deleteFormatter = this.deleteFormatter.bind(this);
    }

     // handles what happens when delete button clicked
     handleDelete = async (event: any, cell: any, row: any, rowIndex: number): Promise<void> => {
        console.log('Delete button clicked');
        console.log("ROW" + Object.keys(row));
        console.log("INDEX: " + rowIndex);
        event.preventDefault();
        const { route } = this.props;
        const { editRows, data } = this.state;
        editRows.delete(row.id);
        const newData = data.filter(function(value, index, arr){ return index !== rowIndex;});
        this.setState({
            editRows,
            data: newData,
        });
     
        // const response = await fetch(`${getServerURL()}${route}`, {
        //     method: 'POST',
        //     credentials: 'include',
        //     body: JSON.stringify({
        //         mode: "delete", // or modify 
        //         id: row.id,
        //       }),
        //     });
        // if (!response.ok) {
        //     throw new Error("Did not save. Please refresh & try again");
        // }
        // const { status } = await response.json();

        // if (status === 'SUCCESS') {
        //     alert("Deleted.");
        // }
    }

    // handles what happens when edit button clicked
    handleEdit = (event: any, row: any): void => {
        event.preventDefault();
        const { editRows } = this.state;
        editRows.add(row.id);
        this.setState({
            editRows: editRows,
        })
        //console.log(row);
    }

    // handles what happens when save button clicked
    handleSave = async (event: any, row: any, rowIndex: number): Promise<void> => {
        event.preventDefault();
        const { route } = this.props;
        const { editRows, data } = this.state;
        editRows.delete(row.id);
        this.setState({
            editRows: editRows,
        });;
        // data in front-end is already updated
        const newRow = data[rowIndex];
        console.log("Checking here");
        console.log(Object.entries(newRow));
        
        const response = await fetch(`${getServerURL()}${route}`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                mode: "modify", // or delete for delete
                ...newRow,
              }),
            });

        // send all fields of this new row
        if (!response.ok) {
            throw new Error("Did not save. Please refresh & try again");
        }
        const { status } = await response.json();

        if (status === 'SUCCESS') {

        }
        // TODO
        // else {
        //     alert('Your edits did not save. Please refresh & try again.');
        // }

        }


    // delete button React component
    deleteFormatter = (cell: any, row: any, rowIndex: number) => {
        return (
            <Button variant='link' className="delete-text" onClick = { (e) => this.handleDelete(e, cell, row, rowIndex) } >
            <div className="row align-items-center">
                <img className="px-1 delete-text" src={DeleteSVG}/>
                <div>Delete</div> 
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
            editRows,
        } = this.state;

        // pagination option
        const paginationOption = {
            custom: true,
            totalSize: this.state.data.length,
        };

        // edit options
        const cellEdit = cellEditFactory({
            mode: 'click',//ORIG TRUE
            blurToSave: false,
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
        // TODO are indices off??
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
            formatter: (cell, row, rowIndex, formatExtraData) => <EditFormatter handleEdit={this.handleEdit} handleSave={this.handleSave} editRows={formatExtraData} row={row} rowIndex={rowIndex}/>, //this.editFormatter(cell, row, rowIndex, formatExtraData),
            editable: false,
            isDummyField: true,
        });

        // add Delete column
        columnsAll.push({
            dataField: 'delete',
            text: '',
            formatter: this.deleteFormatter,
            editable: false,
            isDummyField: true,
        });
    }
    // if current row is on edit mode...
    // this class is applied to each row! rowClasses
    // column format:
            //  list of objects, each object is dataField & text, along with sort T/F.
            // other fields: editable (if editable**), isDummyField (if true), possible formatter
    //  boostrap table receives data DATA:
            // list of objects, where each object's keys is the dataFields above
    // what is cell edit
        const rowClasses = (row, rowIndex) => {
            if (this.state.editRows.has(row.id)) {
                return 'table-edit-row'; // you can define some custon class here for on edit styling
            }
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
                    </div>
                    )
                }
            </PaginationProvider>
        );
    }
}

export default Table;
