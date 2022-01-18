import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import {walletUpdateTransactions} from '../redux/actions/index';
import moment from 'moment';
import DatatableView from './utils/datatable-view';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.transactionHistoryUpdateHandler = undefined;
        this.state                           = {
            transaction_list: []
        };
    }

    componentDidMount() {
        this.transactionHistoryUpdateHandler = setInterval(() => this.props.walletUpdateTransactions(this.props.wallet.address_key_identifier), 2000);
    }

    componentWillUnmount() {
        clearTimeout(this.transactionHistoryUpdateHandler);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.transaction_list.length !== this.props.wallet.transactions.length) {
            const rows = this.props.wallet.transactions.map((transaction, idx) => ({
                clickEvent : () => this.props.history.push('/transaction/' + encodeURIComponent(transaction.transaction_id), [transaction]),
                idx        : this.props.wallet.transactions.length - idx,
                date       : moment.utc(transaction.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                amount     : transaction.amount.toLocaleString('en-US'),
                txid       : transaction.transaction_id,
                stable_date: transaction.stable_date && moment.utc(transaction.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
                parent_date: transaction.parent_date && moment.utc(transaction.parent_date * 1000).format('YYYY-MM-DD HH:mm:ss')
            }));
            this.setState({
                transaction_list: rows
            });
        }
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>transactions</div>
                    <div className={'panel-body'}>
                        <Row id={'txhistory'}>
                            <DatatableView
                                value={this.state.transaction_list}
                                sortField={'date'}
                                sortOrder={-1}
                                resultColumn={[
                                    {
                                        'field'   : 'idx',
                                        'header'  : 'id',
                                        'sortable': true
                                    },
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
    }),
    {
        walletUpdateTransactions
    }
)(withRouter(TransactionHistoryView));
