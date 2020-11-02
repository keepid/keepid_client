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
        console.log('handleEdit');
        setEditable(true);
        props.handleEdit(e, props.row);
    };

    const handleSave = (e): void => {
        console.log('handleSave');
        setEditable(false);
        props.handleSave(e, props.row);
    }
    
    return (
        <Button variant='link' onClick={ (e) => editable ? handleSave(e) : handleEdit(e) }>
            { editable ? 'Save' : 'Edit' }
        </Button>
    );
}

interface Props {
    data: any[],
    columns: any[]
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
     handleDelete = (event: any, cell: any, row: any, rowIndex: number): void => {
        console.log('Delete button clicked');
        console.log(row);
    }

    // handles what happens when edit button clicked
    handleEdit = (event: any, row: any): void => {
        event.preventDefault();
        const { editRows } = this.state;
        editRows.add(row.id);
        this.setState({
            editRows: editRows,
        })
        console.log(row);
    }

    // handles what happens when save button clicked
    handleSave = (event: any, row: any): void => {
        event.preventDefault();
        const { editRows } = this.state;
        editRows.delete(row.id);
        this.setState({
            editRows: editRows,
        });
        console.log(row);
        // need to call API with the data
    }

    // delete button React component
    deleteFormatter = (cell: any, row: any, rowIndex: number) => {
        return (
            <Button variant='link' onClick = { (e) => this.handleDelete(e, cell, row, rowIndex) } >Delete</Button>
        )
    }

    render() {
        const {
            columns,
        } = this.props;


        // pagination option
        const paginationOption = {
            custom: true,
            totalSize: this.state.data.length,
        };

        // edit options
        const cellEdit = cellEditFactory({
            mode: 'click',
            blurToSave: true,
        });

        // controls editing
        const isEditable = (cell: any, row: any, rowIndex: number, colIndex: number) => {
            const { editRows } = this.state;
            return editRows.has(row.id);
        }

        // add edit control for each column
        const columnsAll = columns.map((value, index) => {
            value.editable = isEditable;
            return value;
        });

        // add Edit column
        columnsAll.push({
            dataField: 'edit',
            text: 'Edit',
            formatExtraData: this.state.editRows,
            formatter: (cell, row, rowIndex, formatExtraData) => <EditFormatter handleEdit={this.handleEdit} handleSave={this.handleSave} editRows={formatExtraData} row={row}/>, //this.editFormatter(cell, row, rowIndex, formatExtraData),
            editable: false,
            isDummyField: true,
        });

        // add Delete column
        columnsAll.push({
            dataField: 'delete',
            text: 'Delete',
            formatter: this.deleteFormatter,
            editable: false,
            isDummyField: true,
        });

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
