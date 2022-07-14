import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import * as format from '../helper/format';
import API from '../api';
import ResetTransactionValidationView from './utils/reset-transaction-validation-view';
import Translation from '../common/translation';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            transaction_list          : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.updaterHandler = setInterval(() => this.reloadDatatable, 60000);
    }

    componentWillUnmount() {
        clearInterval(this.updaterHandler);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.getTransactionHistory(this.props.wallet.address_key_identifier).then(data => {
            const rows = data.map((transaction, idx) => ({
                idx         : data.length - idx,
                date        : format.date(transaction.transaction_date),
                amount      : transaction.amount,
                txid        : transaction.transaction_id,
                stable_date : format.date(transaction.stable_date),
                parent_date : format.date(transaction.parent_date),
                double_spend: format.bool_label(transaction.is_double_spend),
                action      : <>
                    <DatatableActionButtonView
                        history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
                        history_state={[transaction]}
                        icon={'eye'}/>
                    <DatatableActionButtonView
                        icon={'rotate-left'}
                        title={Translation.getPhrase('620cf43e3')}
                        callback={() => this.resetTransactionValidationRef.toggleConfirmationModal(transaction.transaction_id)}
                        callback_args={transaction.transaction_id}
                    />
                </>
            }));

            this.setState({
                transaction_list          : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
        return (
            <div>
                <ResetTransactionValidationView onRef={instance => this.resetTransactionValidationRef = instance}/>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('bb2017424')}</div>
                    <div className={'panel-body'}>
                        <Row id={'txhistory'}>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}

                                value={this.state.transaction_list}
                                sortField={'date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'date',
                                        header: Translation.getPhrase('cd55d1db8')
                                    },
                                    {
                                        field : 'amount',
                                        body  : format.formatMillixRow,
                                        header: Translation.getPhrase('0a4e9992e')
                                    },
                                    {
                                        field : 'txid',
                                        header: Translation.getPhrase('da26d66d6')
                                    },
                                    {
                                        field : 'stable_date',
                                        header: Translation.getPhrase('634fdbe34')
                                    },
                                    {
                                        field : 'double_spend',
                                        header: Translation.getPhrase('d8654c020')
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
