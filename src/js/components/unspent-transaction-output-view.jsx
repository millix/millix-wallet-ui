import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Row} from 'react-bootstrap';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import * as format from '../helper/format';
import ResetTransactionValidationView from './utils/reset-transaction-validation-view';


class UnspentTransactionOutputView extends Component {
    constructor(props) {
        super(props);

        this.updaterHandler = undefined;
        this.state          = {
            transaction_output_list   : [],
            stable                    : 1,
            datatable_reload_timestamp: '',
            datatable_loading         : false,
            confirmation_modal_show   : false,
            result_modal_show         : false,
            reset_transaction_id      : ''
        };
    }

    componentDidMount() {
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

    componentWillUnmount() {
        clearInterval(this.updaterHandler);
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
                amount          : output.amount,
                transaction_date: format.date(output.transaction_date),
                stable_date     : format.date(output.stable_date),
                action          : <><DatatableActionButtonView
                    history_path={'/transaction/' + encodeURIComponent(output.transaction_id)}
                    history_state={[output]}
                    icon={'eye'}/>
                    <DatatableActionButtonView
                        icon={'rotate-left'}
                        title={'reset validation'}
                        callback={() => this.resetTransactionValidationRef.toggleConfirmationModal(output.transaction_id)}
                        callback_args={output.transaction_id}
                    />
                </>
            }));
            this.setState({
                transaction_output_list   : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
        let title = '';
        if (this.state.stable) {
            title = 'stable unspents';
        }
        else {
            title = 'pending unspents';
        }

        return (
            <div>
                <ResetTransactionValidationView onRef={instance => this.resetTransactionValidationRef = instance}/>
                <div className={'panel panel-filled'}>
                    <div
                        className={'panel-heading bordered'}>
                        {title}
                    </div>
                    <div className={'panel-body'}>
                        <div className={'form-group'}>
                            an unspent is a transaction output sent to your address that you received and
                            have not used to fund a payment. your balance is the sum of your validated unspents. your pending balance is the sum of your
                            unspents that haven't been validated yet.
                            when you send a transaction using an unspent, or group of unspents, whose sum is bigger than your payment, you will receive the
                            remaining change as a new unspent.
                        </div>
                        <Row id={'txhistory'}>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button={{
                                    label   : 'reset validation',
                                    icon    : 'rotate-left',
                                    on_click: this.state.stable === 0 && this.state.transaction_output_list.length > 0 && (() => this.resetTransactionValidationRef.toggleConfirmationModal(this.state.transaction_output_list)),
                                    args    : this.state.transaction_output_list
                                }}
                                value={this.state.transaction_output_list}
                                sortField={'transaction_date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'transaction_date',
                                        header: 'date'
                                    },
                                    {
                                        field : 'amount',
                                        format: 'amount'
                                    },
                                    {
                                        field: 'address'
                                    },
                                    {
                                        field: 'transaction_id'
                                    },
                                    {
                                        field: 'output_position'
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
