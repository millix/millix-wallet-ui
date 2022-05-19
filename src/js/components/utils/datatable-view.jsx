import React, {Component} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import PropTypes from 'prop-types';
import {Dropdown} from 'primereact/dropdown';
import {Ripple} from 'primereact/ripple';
import {classNames} from 'primereact/utils';
import * as format from '../../helper/format';
import {FilterMatchMode} from 'primereact/api';
import DatatableHeaderView from './datatable-header-view';


class DatatableView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first                     : 0,
            rows                      : 20,
            currentPage               : 1,
            result_column             : [],
            result_filter             : {
                global: {
                    value    : null,
                    matchMode: FilterMatchMode.CONTAINS
                }
            },
            result_global_search_field: [],
            global_search_value       : ''
        };

        this.onCustomPage       = this.onCustomPage.bind(this);
        this.bodyTemplateAmount = this.bodyTemplateAmount.bind(this);
    }

    componentDidMount() {
        this.generateResultColumn();
    }

    generateResultColumn() {
        const result_global_search_field = [];
        const result_column              = [];
        this.props.resultColumn.forEach((item, index) => {
            if (typeof (item.header) === 'undefined') {
                item.header = item.field.replaceAll('_', ' ');
            }

            if (typeof (item.sortable) === 'undefined') {
                item.sortable = true;
            }

            if (typeof (item.format) !== 'undefined' && item.format === 'amount') {
                item.body = (rowData) => this.bodyTemplateAmount(rowData, item.field);
            }

            if (typeof (item.filter_type) !== 'undefined' && item.filter_type === 'multi_select') {
                item.filter = true;
            }

            result_global_search_field.push(item.field);
            result_column.push(<Column
                key={index}
                field={item.field}
                header={item.header}
                // filter={item.filter}
                // filterField={item.field}
                // filterElement={this.filterTemplateMultiSelect}

                showFilterMatchModes={false}
                sortable={item.sortable}
                body={item.body}/>);
        });

        if (this.props.showActionColumn) {
            result_column.push(<Column
                key={'action'}
                className={'datatable_action_column'}
                field={'action'}
                header={'action'}
                sortable={false}/>);
        }

        this.setState({
            'result_column'             : result_column,
            'result_global_search_field': result_global_search_field
        });
    }

    onCustomPage(event) {
        this.setState({
            first: event.first,
            rows : event.rows
        });
    }

    bodyTemplateAmount(rowData, field) {
        return format.millix(rowData[field], false);
    }

    getPaginatorTemplate() {
        return {
            layout               : 'RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
            'PrevPageLink'       : (options) => {
                return (
                    <button type="button" className={options.className}
                            onClick={options.onClick}
                            disabled={options.disabled}>
                        <span className="p-p-3">previous</span>
                        <Ripple/>
                    </button>
                );
            },
            'NextPageLink'       : (options) => {
                return (
                    <button type="button" className={options.className}
                            onClick={options.onClick}
                            disabled={options.disabled}>
                        <span className="p-p-3">next</span>
                        <Ripple/>
                    </button>
                );
            },
            'PageLinks'          : (options) => {
                if ((options.view.startPage === options.page && options.view.startPage !== 0) || (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
                    const className = classNames(options.className, {'p-disabled': true});

                    return <span className={className}
                                 style={{userSelect: 'none'}}>...</span>;
                }

                return (
                    <button type="button" className={options.className}
                            onClick={options.onClick}>
                        {options.page + 1}
                        <Ripple/>
                    </button>
                );
            },
            'RowsPerPageDropdown': (options) => {
                const dropdownOptions = [
                    {
                        label: 10,
                        value: 10
                    },
                    {
                        label: 20,
                        value: 20
                    },
                    {
                        label: 50,
                        value: 50
                    },
                    {
                        label: 100,
                        value: 100
                    },
                    {
                        label: 'all',
                        value: options.totalRecords
                    }
                ];

                return <div
                    className={'paginator-dropdown-wrapper'}>show<Dropdown
                    value={options.value} options={dropdownOptions}
                    onChange={options.onChange} className={'align-middle'}/>
                    records
                . total records {options.totalRecords}.</div>;
            }
        };
    }

    // filterTemplateMultiSelect(options) {
    //     console.log(options);
    //     return <MultiSelect value={options.value} options={this.representatives} //itemTemplate={this.representativesItemTemplate}
    //                         onChange={(e) => options.filterCallback(e.value)} optionLabel="name" placeholder="Any" className="p-column-filter"/>;
    // }

    // filterClearTemplate(options) {
    //     return <Button type="button" icon="pi pi-times" onClick={options.filterClearCallback} className="p-button-secondary"></Button>;
    // }
    //
    // filterApplyTemplate(options) {
    //     return <Button type="button" icon="pi pi-check" onClick={options.filterApplyCallback} className="p-button-success"></Button>;
    // }
    //
    // filterFooterTemplate() {
    //     return <div className="px-3 pt-0 pb-3 text-center font-bold">Customized Buttons</div>;
    // }

    on_global_search_change(e) {
        const value                   = e.target.value;
        let result_filter             = {...this.state.result_filter};
        result_filter['global'].value = value;

        this.setState({
            result_filter,
            global_search_value: value
        });
    }

    render() {
        return (
            <>
                <DatatableHeaderView
                    reload_datatable={this.props.reload_datatable}
                    datatable_reload_timestamp={this.props.datatable_reload_timestamp}
                    action_button={this.props.action_button}
                    on_global_search_change={(e) => this.on_global_search_change(e)}
                    datatable_reference={this.datatable_reference}
                    allow_export={this.props.allow_export}
                />
                <DataTable value={this.props.value}
                           ref={(el) => {
                               this.datatable_reference = el;
                           }}
                           paginator
                           paginatorTemplate={this.getPaginatorTemplate()}
                           first={this.state.first}
                           rows={this.state.rows}
                           onPage={this.onCustomPage}
                           paginatorClassName="p-jc-end"
                           loading={this.props.loading}
                           stripedRows
                           showGridlines
                           resizableColumns
                           columnResizeMode="fit"
                           sortField={this.props.sortField}
                           sortOrder={this.props.sortOrder}
                           emptyMessage="no records found"

                           globalFilterFields={this.state.result_global_search_field}
                           filters={this.state.result_filter}
                           filterDisplay="menu"

                           responsiveLayout="scroll">
                    {this.state.result_column}
                </DataTable>
            </>
        );
    }
}


DatatableView.propTypes = {
    value                     : PropTypes.array.isRequired,
    resultColumn              : PropTypes.array.isRequired,
    sortField                 : PropTypes.string,
    sortOrder                 : PropTypes.number,
    showActionColumn          : PropTypes.bool,
    reload_timestamp          : PropTypes.any,
    loading                   : PropTypes.bool,
    datatable_reload_timestamp: PropTypes.any,
    reload_datatable          : PropTypes.func,
    action_button             : PropTypes.any,
    allow_export              : PropTypes.bool
};


export default DatatableView;
