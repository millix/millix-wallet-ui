import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Button, Col, Row} from 'react-bootstrap';
import moment from 'moment';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableHeaderView from './utils/datatable-header-view';


class UnspentTransactionOutputView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            transaction_output_list   : [],
            stable                    : 1,
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        moment.relativeTimeThreshold('ss', -1); // required to get diff in
        // seconds instead of "a few
        // seconds ago"

        const stable_value_new = this.getStableFromUrl();
        this.setState({
            stable: stable_value_new
        }, this.reloadDatatable);

        this.updaterHandler = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const stable_value_new     = this.getStableFromUrl();
        const stable_value_current = this.state.stable;
        if (stable_value_new !== stable_value_current || this.props.wallet.address_key_identifier !== prevProps.wallet.address_key_identifier) {
            this.setState({
                stable: stable_value_new
            }, this.reloadDatatable);
        }
    }

    getStableFromUrl() {
        const stable_filter  = this.props.location.pathname.split('/').pop();
        let stable_value_new = 1;
        if (stable_filter === 'pending') {
            stable_value_new = 0;
        }

        return stable_value_new;
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.getWalletUnspentTransactionOutputList(this.props.wallet.address_key_identifier, this.state.stable).then(data => {
            let rows = data.filter(output => output.status !== 3).map((output, idx) => ({
                idx             : data.length - idx,
                transaction_id  : output.transaction_id,
                address         : output.address,
                output_position : output.output_position,
                amount          : output.amount.toLocaleString('en-US'),
                transaction_date: moment.utc(output.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                stable_date     : output.stable_date && moment.utc(output.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                action          : <DatatableActionButtonView
                    history_path={'/transaction/' + encodeURIComponent(output.transaction_id)}
                    history_state={[output]}
                    icon={'eye'}/>
            }));
            this.setState({
                transaction_output_list   : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    componentWillUnmount() {
        clearTimeout(this.updaterHandler);
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div
                        className={'panel-heading bordered'}>
                        {this.state.stable ? '' : 'pending'} unspent
                        transaction output list
                    </div>
                    <div className={'panel-body'}>
                        <DatatableHeaderView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                        />
                        <Row id={'txhistory'}>
                            <DatatableView
                                value={this.state.transaction_output_list}
                                sortField={'transaction_date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        'field'   : 'transaction_date',
                                        'header'  : 'date',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'transaction_id',
                                        'header'  : 'transaction id',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'output_position',
                                        'header'  : 'output position',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'address',
                                        'header'  : 'address',
                                        'sortable': true
                                    },

                                    {
                                        'field'   : 'amount',
                                        'header'  : 'amount',
                                        'sortable': true
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(UnspentTransactionOutputView));
