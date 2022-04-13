import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import API from '../api';
import _ from 'lodash';
import * as format from '../helper/format';
import DatatableView from './utils/datatable-view';


class MessageReceivedView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            message_list              : [],
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

        //here
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>messages received
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <DatatableView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            value={this.state.message_list}
                            sortField={'address_position'}
                            sortOrder={1}
                            resultColumn={[
                                {
                                    field : 'subject',
                                    header: 'subject'
                                },
                                {
                                    field : 'address',
                                    header: 'address'
                                },
                                {
                                    field : 'amount',
                                    header: 'amount'
                                }
                            ]}/>
                    </Row>
                </div>
            </div>
        );
    }
}

export default withRouter(MessageReceivedView);
