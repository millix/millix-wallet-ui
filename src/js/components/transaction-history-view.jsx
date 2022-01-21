import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row} from 'react-bootstrap';
import moment from 'moment';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.transactionHistoryUpdateHandler = undefined;
        this.state                           = {
            transaction_list          : [],
            datatable_reload_timestamp: ''
        };
    }

    componentDidMount() {
        moment.relativeTimeThreshold('ss', -1); // required to get diff in
                                                // seconds instead of "a few
                                                // seconds ago"

        this.reloadDatatable();
        this.transactionHistoryUpdateHandler = setInterval(() => this.reloadDatatable, 60000);
    }

    componentWillUnmount() {
        clearTimeout(this.transactionHistoryUpdateHandler);
    }

    reloadDatatable() {
        return API.getTransactionHistory(this.props.wallet.address_key_identifier).then(data => {
            const rows = data.map((transaction, idx) => ({
                idx        : data.length - idx,
                date       : moment.utc(transaction.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                amount     : transaction.amount.toLocaleString('en-US'),
                txid       : transaction.transaction_id,
                stable_date: transaction.stable_date && moment.utc(transaction.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                parent_date: transaction.parent_date && moment.utc(transaction.parent_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                action     : <DatatableActionButtonView
                    history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
                    history_state={[transaction]}/>
            }));

            this.setState({
                transaction_list          : rows,
                datatable_reload_timestamp: new Date()
            });
        });
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>transactions</div>
                    <div className={'panel-body'}>
                        <div className={'datatable_action_row'}>
                            <Col md={4}>
                                <Button variant="outline-primary"
                                        className={'btn-sm refresh_button'}
                                        onClick={() => this.reloadDatatable()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                            <Col md={4} className={'datatable_refresh_ago'}>
                            <span>
                                refreshed {this.state.datatable_reload_timestamp && moment(this.state.datatable_reload_timestamp).fromNow()}
                            </span>
                            </Col>
                        </div>
                        <Row id={'txhistory'}>
                            <DatatableView
                                value={this.state.transaction_list}
                                sortField={'date'}
                                sortOrder={-1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        'field'   : 'date',
                                        'header'  : 'date',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'txid',
                                        'header'  : 'transaction id',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'amount',
                                        'header'  : 'amount',
                                        'sortable': true
                                    },
                                    {
                                        'field'   : 'stable_date',
                                        'header'  : 'stable date',
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
)(withRouter(TransactionHistoryView));
