import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Row} from 'react-bootstrap';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import * as format from '../helper/format';
import ResetTransactionValidationView from './utils/reset-transaction-validation-view';
import Translation from '../common/translation';


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

        this.reloadDatatable = this.reloadDatatable.bind(this);
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
                        title={Translation.getPhrase('fcdda880e')}
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
        let title;
        if (this.state.stable) {
            title = Translation.getPhrase('164dc0ea9');
        }
        else {
            title = Translation.getPhrase('faeff0851');
        }

        return (
            <div>
                <ResetTransactionValidationView onRef={instance => this.resetTransactionValidationRef = instance} reloadDatatable={this.reloadDatatable}/>
                <div className={'panel panel-filled'}>
                    <div
                        className={'panel-heading bordered'}>
                        {title}
                    </div>
                    <div className={'panel-body'}>
                        <div className={'form-group'}>
                            {Translation.getPhrase('4c8afee38')}
                        </div>
                        <Row id={'txhistory'}>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button={{
                                    label   : Translation.getPhrase('8f381845e'),
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
                                        header: Translation.getPhrase('021cfa5ad')
                                    },
                                    {
                                        field : 'amount',
                                        header: Translation.getPhrase('c86534ace')
                                    },
                                    {
                                        field: 'address',
                                        header: Translation.getPhrase('5795a5856')
                                    },
                                    {
                                        field: 'transaction_id',
                                        header: Translation.getPhrase('1a6323a17')
                                    },
                                    {
                                        field: 'output_position',
                                        header: Translation.getPhrase('8d11dfdb0')
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
