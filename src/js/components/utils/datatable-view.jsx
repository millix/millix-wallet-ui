import React from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import PropTypes from 'prop-types';

const DatatableView = (props) => {
    const column = [];
    props.resultColumn.forEach((item, index) => {
        column.push(<Column
            key={index}
            field={item.field}
            header={item.header}
            sortable={item.sortable}/>);
    });

    return (
        <DataTable value={props.value}
                   stripedRows
                   showGridlines
                   resizableColumns
                   columnResizeMode="fit"
                   sortField={props.sortField} sortOrder={props.sortOrder}
                   responsiveLayout="scroll">
            {column}
        </DataTable>
    );
};

DatatableView.propTypes = {
    value       : PropTypes.array.isRequired,
    resultColumn: PropTypes.array.isRequired,
    sortField   : PropTypes.string,
    sortOrder   : PropTypes.number
};

export default DatatableView;
