import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory, {
    PaginationProvider,
    PaginationListStandalone,
    PaginationTotalStandalone,
    SizePerPageDropdownStandalone
} from 'react-bootstrap-table2-paginator';

interface Props {
    data: any[],
    columns: any[]
}

function Table(props: Props): React.ReactElement {

    const {
        data,
        columns,
    } = props

    const paginationOption = {
        custom: true,
        totalSize: data.length
    };
    
    return (
        <PaginationProvider
            pagination={ paginationFactory(paginationOption) }
        >
        {
            ({
                paginationProps, // some of the pagination stuff should be passed in as props
                paginationTableProps
            }) => (
            <div>
                <BootstrapTable
                    keyField="id"
                    data={ data}
                    columns={ columns }
                    { ...paginationTableProps }
                />
                <SizePerPageDropdownStandalone
                { ...paginationProps }
                />
                <PaginationTotalStandalone
                { ...paginationProps }
                />
                <PaginationListStandalone
                { ...paginationProps }
                />
            </div>
            )
        }
        </PaginationProvider>
    );
}

export default Table;
