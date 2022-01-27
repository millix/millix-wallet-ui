import React, {Component} from 'react';
import API from '../api';
import _ from 'lodash';
import * as format from '../helper/format';
import DatatableHeaderView from './utils/datatable-header-view';
import {Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';


class AddressListView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            address_list              : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.datatable_reload_interval = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentWillUnmount() {
        clearTimeout(this.datatable_reload_interval);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        API.listAddresses(this.props.wallet.address_key_identifier).then(data => {
            let address_list = _.sortBy(_.map(data, itemAddress => {
                return {
                    address         : itemAddress.address,
                    address_position: itemAddress.address_position,
                    address_version : itemAddress.address_version,
                    create_date     : format.date(itemAddress.create_date)
                };
            }), address => -address.address_position);

            this.setState({
                address_list              : address_list,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    generateAddress() {
        API.getNextAddress()
           .then(() => this.reloadDatatable());
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>addresses
                </div>
                <div className={'panel-body'}>
                    <DatatableHeaderView
                        reload_datatable={() => this.reloadDatatable()}
                        datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                        action_button_on_click={() => this.generateAddress()}
                        action_button_label={'generate address'}
                    />
                    <Row>
                        <DatatableView
                            value={this.state.address_list}
                            sortField={'address_position'}
                            sortOrder={1}
                            resultColumn={[
                                {
                                    field : 'address_position',
                                    header: 'position'
                                },
                                {
                                    field : 'address',
                                    header: 'address'
                                },
                                {
                                    field : 'address_version',
                                    header: 'version'
                                },
                                {
                                    field: 'create_date'
                                }
                            ]}/>
                    </Row>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(AddressListView));
