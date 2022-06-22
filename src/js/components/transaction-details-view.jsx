import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {Button, Col, Table} from 'react-bootstrap';
import {clearTransactionDetails, updateTransactionDetails} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import config from '../../config';
import DatatableView from './utils/datatable-view';
import * as format from '../helper/format';
import HelpIconView from './utils/help-icon-view';
import ResetTransactionValidationView from './utils/reset-transaction-validation-view';
import {bool_label} from '../helper/format';
import API from '../api';
import ErrorList from './utils/error-list-view';
import Translation from '../common/translation';


class TransactionDetailsView extends Component {
    transaction_id;

    constructor(props) {
        super(props);

        this.updateHandler           = undefined;
        this.state                   = {
            transaction: undefined,
            error_list : []
        };
        this.reloadTransactionDetail = this.reloadTransactionDetail.bind(this);
    }

    componentDidMount() {
        this.updateTransaction();
    }

    updateTransaction(){
        this.transaction_id = decodeURIComponent(this.props.match.params.transaction_id);
        this.reloadTransactionDetail();
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const newTransactionID = decodeURIComponent(nextProps.match.params.transaction_id);
        if(this.transaction_id !== newTransactionID){
            this.updateTransaction();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.updateHandler);
    }

    reloadTransactionDetail() {
        API.getTransaction(this.transaction_id, config.GENESIS_SHARD_ID)
           .then(transaction => {
               if (transaction.transaction_id) {
                   this.setState({
                       transaction
                   });
               }
               else {
                   this.setState({
                       error_list: [
                           {
                               message: Translation.getPhrase('ff8a8864b')
                           }
                       ]
                   });
               }

               this.updateHandler = setTimeout(this.reloadTransactionDetail, 5000);
           });
    }

    getTransactionInputOutputLink(input) {
        if (input.output_transaction_id === config.GENESIS_TRANSACTION_ID) {
            return '';
        }

        return <Link to={'/transaction/' + encodeURIComponent(input.output_transaction_id)}>
            <Button
                variant="outline-default"
                className={'btn-xs icon_only ms-auto'}>
                <FontAwesomeIcon
                    icon={'eye'}
                    size="1x"/>
            </Button>
        </Link>;
    }

    isDoubleSpend(transaction) {
        let is_double_spend = false;
        Object.keys(transaction.transaction_input_list).forEach(key => {
            if (transaction.transaction_input_list[key].is_double_spend !== 0) {
                is_double_spend = true;
            }
        });
        Object.keys(transaction.transaction_output_list).forEach(key => {
            if (transaction.transaction_output_list[key].is_double_spend !== 0) {
                is_double_spend = true;
            }
        });

        return is_double_spend;
    }

    getIsDoubleSpendLabel(is_double_spend) {
        let is_double_spend_label = bool_label(is_double_spend);
        if (is_double_spend) {
            is_double_spend_label = <span className={'text-danger'}>{is_double_spend_label}</span>;
        }

        return is_double_spend_label;
    }

    render() {
        let {transaction}           = this.state;
        let stable_value            = '';
        let is_double_spend_label   = '';
        let transaction_output_list = [];
        let transaction_input_list  = [];
        if (transaction) {
            if (transaction.transaction_output_list) {
                transaction_output_list = transaction.transaction_output_list.map((output, idx) => ({
                    address          : output.address,
                    output_position  : output.output_position,
                    amount           : output.amount,
                    is_double_spend  : this.getIsDoubleSpendLabel(output.is_double_spend),
                    double_spend_date: format.date(output.double_spend_date),
                    is_stable        : format.bool_label(output.is_stable),
                    stable_date      : format.date(output.stable_date),
                    status           : format.transaction_status_label(output.status)
                }));
            }

            if (transaction.transaction_input_list) {
                transaction_input_list = transaction.transaction_input_list.map((input, idx) => ({
                    address                : input.address,
                    input_position         : input.input_position,
                    output_transaction_id  : input.output_transaction_id,
                    output_position        : input.output_position,
                    output_transaction_date: format.date(input.output_transaction_date),
                    is_double_spend        : this.getIsDoubleSpendLabel(input.is_double_spend),
                    double_spend_date      : format.date(input.double_spend_date),
                    is_stable              : format.bool_label(input.is_stable),
                    stable_date            : format.date(input.stable_date),
                    status                 : format.transaction_status_label(input.status),
                    action                 : this.getTransactionInputOutputLink(input)
                }));
            }

            stable_value = format.bool_label(transaction.is_stable);
            if (transaction.stable_date) {
                stable_value += ` (${format.date(transaction.stable_date)})`;
            }

            is_double_spend_label = this.getIsDoubleSpendLabel(this.isDoubleSpend(transaction));
        }

        return (
            <>
                <ResetTransactionValidationView onRef={instance => this.resetTransactionValidationRef = instance}/>
                <Col md="12">
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>
                            {Translation.getPhrase('1cb3d0a9b')}
                        </div>
                        <div className={'panel-body'}>
                            <ErrorList
                                error_list={this.state.error_list}/>

                            {transaction && <>
                                <div className={'section_subtitle'}>
                                <span>
                                {Translation.getPhrase('7a6095c1f')}
                                </span>
                                    <Button
                                        className={'ms-auto'}
                                        variant="outline-primary"
                                        size={'sm'}
                                        onClick={() => this.resetTransactionValidationRef.toggleConfirmationModal(transaction.transaction_id)}
                                        title={Translation.getPhrase('6e1917558')}
                                    >
                                        <FontAwesomeIcon
                                            icon="rotate-left"
                                            size="1x"/>
                                        {Translation.getPhrase('9935457f0')}
                                    </Button>
                                </div>

                                <Table striped bordered hover>
                                    <tbody>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('0ce9af6ca')}
                                        </td>
                                        <td>
                                            {transaction.transaction_id}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('2faeb4201')}
                                        </td>
                                        <td>
                                            {transaction.shard_id}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('f03a7df51')}
                                        </td>
                                        <td>
                                            {transaction.version}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('3416d8447')}
                                        </td>
                                        <td>
                                            {format.date(transaction.transaction_date)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('a954b833e')}
                                        </td>
                                        <td>
                                            {stable_value}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('808aa2285')}<HelpIconView
                                            key={'transaction_status'}
                                            help_item_name={'transaction_status'}/>
                                        </td>
                                        <td>
                                            {format.transaction_status_label(transaction.status)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('5aee3304e')}
                                        </td>
                                        <td>
                                            {transaction.node_id_origin}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('e9275e2d4')}
                                        </td>
                                        <td>
                                            {transaction.node_id_proxy}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            {Translation.getPhrase('e03f9df7e')}
                                        </td>
                                        <td>
                                            {is_double_spend_label}
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>

                                <div className={'mb-3'}>
                                    <div className={'section_subtitle'}>
                                        {Translation.getPhrase('e754865b7')}<HelpIconView
                                        help_item_name={'transaction_input'}/>
                                    </div>
                                    <DatatableView
                                        value={transaction_input_list}
                                        sortField={'input_position'}
                                        sortOrder={1}
                                        showActionColumn={true}
                                        resultColumn={[
                                            {
                                                field: 'input_position',
                                                header: Translation.getPhrase('16f28fe33')
                                            },
                                            {
                                                field: 'output_transaction_id',
                                                header: Translation.getPhrase('615b87122')
                                            },
                                            {
                                                field: 'output_position',
                                                header: Translation.getPhrase('acc570cb3')
                                            },
                                            {
                                                field: 'output_transaction_date',
                                                header: Translation.getPhrase('0f9bca157')
                                            },
                                            {
                                                field: 'is_double_spend',
                                                header: Translation.getPhrase('43adcdf9e')
                                            },
                                            {
                                                field: 'double_spend_date',
                                                header: Translation.getPhrase('d94b61cfd')
                                            },
                                            {
                                                field: 'is_stable',
                                                header: Translation.getPhrase('089586ec8')
                                            },
                                            {
                                                field: 'stable_date',
                                                header: Translation.getPhrase('c43a5e401')
                                            },
                                            {
                                                field: 'status',
                                                header: Translation.getPhrase('f46aa05ea')
                                            }
                                        ]}/>
                                </div>

                                <div className={'section_subtitle'}>
                                    {Translation.getPhrase('bad83bc53')}<HelpIconView
                                    help_item_name={'transaction_output'}/>
                                </div>
                                <DatatableView
                                    value={transaction_output_list}
                                    sortField={'output_position'}
                                    sortOrder={1}
                                    resultColumn={[
                                        {
                                            field: 'address',
                                            header: Translation.getPhrase('2d8702d1e')
                                        },
                                        {
                                            field: 'output_position',
                                            header: Translation.getPhrase('061ec7249')
                                        },
                                        {
                                            field : 'amount',
                                            format: 'amount',
                                            header: Translation.getPhrase('7daee9d7b')
                                        },
                                        {
                                            field: 'is_double_spend',
                                            header: Translation.getPhrase('64cbba64f')
                                        },
                                        {
                                            field: 'double_spend_date',
                                            header: Translation.getPhrase('969d5ec7a')
                                        },
                                        {
                                            field: 'is_stable',
                                            header: Translation.getPhrase('51a8a8e7a')
                                        },
                                        {
                                            field: 'stable_date',
                                            header: Translation.getPhrase('f926e9ce5')
                                        },
                                        {
                                            field: 'status',
                                            header: Translation.getPhrase('29f7cadf0')
                                        }
                                    ]}/>
                            </>}
                        </div>
                    </div>
                </Col>
            </>
        );
    }
}


export default connect(state => ({
    transaction: state.transactionDetails
}), {
    clearTransactionDetails,
    updateTransactionDetails
})(withRouter(TransactionDetailsView));
