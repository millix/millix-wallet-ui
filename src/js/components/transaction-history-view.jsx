import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import {walletUpdateTransactions} from '../redux/actions/index';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.transactionHistoryUpdateHandler = undefined;
        this.state                 = {
            fileKey         : new Date().getTime(),
            transaction_list: {
                columns: [
                    {
                        label: '#',
                        field: 'idx'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="user-clock" size="1x"/>,
                            ' date'
                        ],
                        field: 'date'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' transaction id'
                        ],
                        field: 'txid'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="compress-arrows-alt"
                                             size="1x"/>,
                            ' amount'
                        ],
                        field: 'amount'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="clock" size="1x"/>,
                            ' stable date'
                        ],
                        field: 'stable_date'
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="clock" size="1x"/>,
                            ' parent date'
                        ],
                        field: 'parent_date'
                    }
                ],
                rows   : []
            }
        };
    }

    componentDidMount() {
        this.transactionHistoryUpdateHandler = setInterval(() => this.props.walletUpdateTransactions(this.props.wallet.address_key_identifier), 2000);
    }

    componentWillUnmount() {
        clearTimeout(this.transactionHistoryUpdateHandler);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.transaction_list.rows.length !== this.props.wallet.transactions.length) {
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
                transaction_list: {
                    columns: [...this.state.transaction_list.columns],
                    rows
                }
            });
        }
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>transactions</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>
                        <Row id={'txhistory'}>
                            <DataTable striped
                                       bordered
                                       small
                                       hover
                                       autoWidth={false}
                                       info={false}
                                       entries={10}
                                       disableRetreatAfterSorting
                                       onPageChange={page => this.setState({page})}
                                       entriesOptions={[
                                           10,
                                           30,
                                           50
                                       ]}
                                       data={this.state.transaction_list}/>
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
