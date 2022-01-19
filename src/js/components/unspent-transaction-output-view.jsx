import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Row} from 'react-bootstrap';
import moment from 'moment';
import {walletUpdateTransactions} from '../redux/actions';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';


class UnspentTransactionOutputView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            transaction_output_list: []
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.updaterHandler = setInterval(() => this.reloadDatatable(), 5000);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.location.state.stable !== prevProps.location.state.stable || this.props.wallet.address_key_identifier !== prevProps.wallet.address_key_identifier) {
            this.reloadDatatable();
        }
    }

    reloadDatatable() {
        return API.getWalletUnspentTransactionOutputList(this.props.wallet.address_key_identifier, this.props.location.state.stable).then(data => {
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
                    history_state={[output]}/>
            }));
            this.setState({
                transaction_output_list: rows
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
                        {this.props.location.state.stable ? '' : 'pending'} unspent
                        transaction output list
                    </div>
                    <div className={'panel-body'}>
                        <Row id={'txhistory'}>
                            <DatatableView
                                value={this.state.transaction_output_list}
                                sortField={'transaction_date'}
                                sortOrder={-1}
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
    }),
    {
        walletUpdateTransactions
    }
)(withRouter(UnspentTransactionOutputView));
