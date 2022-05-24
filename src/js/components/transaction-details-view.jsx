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
        this.transaction_id = decodeURIComponent(this.props.match.params.transaction_id);
        this.reloadTransactionDetail();
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
                               message: 'failed to load transaction'
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
                            transaction detail
                        </div>
                        <div className={'panel-body'}>
                            <ErrorList
                                error_list={this.state.error_list}/>

                            {transaction && <>
                                <div className={'section_subtitle'}>
                                <span>
                                transaction
                                </span>
                                    <Button
                                        className={'ms-auto'}
                                        variant="outline-primary"
                                        size={'sm'}
                                        onClick={() => this.resetTransactionValidationRef.toggleConfirmationModal(transaction.transaction_id)}
                                        title={'reset validation'}
                                    >
                                        <FontAwesomeIcon
                                            icon="rotate-left"
                                            size="1x"/>
                                        reset validation
                                    </Button>
                                </div>

                                <Table striped bordered hover>
                                    <tbody>
                                    <tr>
                                        <td className={'w-20'}>
                                            transaction id
                                        </td>
                                        <td>
                                            {transaction.transaction_id}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            shard id
                                        </td>
                                        <td>
                                            {transaction.shard_id}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            version
                                        </td>
                                        <td>
                                            {transaction.version}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            transaction date
                                        </td>
                                        <td>
                                            {format.date(transaction.transaction_date)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            stable
                                        </td>
                                        <td>
                                            {stable_value}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            status<HelpIconView
                                            help_item_name={'transaction_status'}/>
                                        </td>
                                        <td>
                                            {format.transaction_status_label(transaction.status)}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className={'w-20'}>
                                            node id sender
                                        </td>
                                        <td>
                                            {transaction.node_id_origin}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            node id proxy
                                        </td>
                                        <td>
                                            {transaction.node_id_proxy}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={'w-20'}>
                                            double spend
                                        </td>
                                        <td>
                                            {is_double_spend_label}
                                        </td>
                                    </tr>
                                    </tbody>
                                </Table>

                                <div className={'mb-3'}>
                                    <div className={'section_subtitle'}>
                                        input list<HelpIconView
                                        help_item_name={'transaction_input'}/>
                                    </div>
                                    <DatatableView
                                        value={transaction_input_list}
                                        sortField={'input_position'}
                                        sortOrder={1}
                                        showActionColumn={true}
                                        resultColumn={[
                                            {
                                                field: 'input_position'
                                            },
                                            {
                                                field: 'output_transaction_id'
                                            },
                                            {
                                                field: 'output_position'
                                            },
                                            {
                                                field: 'output_transaction_date'
                                            },
                                            {
                                                field: 'is_double_spend'
                                            },
                                            {
                                                field: 'double_spend_date'
                                            },
                                            {
                                                field: 'is_stable'
                                            },
                                            {
                                                field: 'stable_date'
                                            },
                                            {
                                                field: 'status'
                                            }
                                        ]}/>
                                </div>

                                <div className={'section_subtitle'}>
                                    output list<HelpIconView
                                    help_item_name={'transaction_output'}/>
                                </div>
                                <DatatableView
                                    value={transaction_output_list}
                                    sortField={'output_position'}
                                    sortOrder={1}
                                    resultColumn={[
                                        {
                                            field: 'address'
                                        },
                                        {
                                            field: 'output_position'
                                        },
                                        {
                                            field : 'amount',
                                            format: 'amount'
                                        },
                                        {
                                            field: 'is_double_spend'
                                        },
                                        {
                                            field: 'double_spend_date'
                                        },
                                        {
                                            field: 'is_stable'
                                        },
                                        {
                                            field: 'stable_date'
                                        },
                                        {
                                            field: 'status'
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
