import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {clearTransactionDetails, updateTransactionDetails} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import config from '../../config';
import moment from 'moment';
import DatatableView from './utils/datatable-view';


class TransactionDetailsView extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (!this.props.transaction) {
            this.props.updateTransactionDetails(decodeURIComponent(this.props.match.params.transaction_id), config.GENESIS_SHARD_ID);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        let transactionID = decodeURIComponent(nextProps.match.params.transaction_id);
        if (this.props.transaction && transactionID !== this.props.transaction.transaction_id) {
            this.props.clearTransactionDetails();
            this.props.updateTransactionDetails(transactionID, config.GENESIS_SHARD_ID);
        }
    }

    getBoolLabel(value) {
        return value ? 'yes' : 'no';
    }

    getTransactionInputOutputLink(input) {
        if (input.output_transaction_id === config.GENESIS_TRANSACTION_ID) {
            return '';
        }

        return <Link to={'/transaction/' +
                         encodeURIComponent(input.output_transaction_id)}>
            <Button
                variant="outline-default"
                className={'btn-xs icon_only ms-auto'}>
                <FontAwesomeIcon
                    icon={'th-list'}
                    size="1x"/>
            </Button>
        </Link>;
    }

    render() {
        let {transaction} = this.props;
        if (!transaction) {
            return '';
        }

        const transaction_output_list = transaction.transaction_output_list.map((output, idx) => ({
            address          : output.address,
            output_position  : output.output_position,
            amount           : output.amount,
            is_double_spend  : this.getBoolLabel(output.is_double_spend),
            double_spend_date: output.double_spend_date && moment.utc(output.double_spend_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
            is_stable        : this.getBoolLabel(output.is_stable),
            stable_date      : output.stable_date && moment.utc(output.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
            status           : output.status
        }));

        const transaction_input_list = transaction.transaction_input_list.map((input, idx) => ({
            address                : input.address,
            input_position         : input.input_position,
            output_transaction_id  : input.output_transaction_id,
            output_position        : input.output_position,
            output_transaction_date: input.output_transaction_date && moment.utc(input.output_transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
            is_double_spend        : this.getBoolLabel(input.is_double_spend),
            double_spend_date      : input.double_spend_date && moment.utc(input.double_spend_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
            is_stable              : this.getBoolLabel(input.is_stable),
            stable_date            : input.stable_date && moment.utc(input.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss'),
            status                 : input.status,
            action                 : this.getTransactionInputOutputLink(input)
        }));

        return (
            <>
                <Col md="12">
                    {/*<Button variant="outline-primary"*/}
                    {/*        onClick={this.props.history.goBack}>*/}
                    {/*    <FontAwesomeIcon icon="arrow-circle-left"*/}
                    {/*                     size="1x"/>*/}
                    {/*    back*/}
                    {/*</Button>*/}
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>
                            transaction detail
                        </div>
                        <div className={'panel-body'}>
                            <div className={'section_subtitle'}>
                                transaction
                            </div>
                            <Table striped bordered hover className={'mb-3'}>
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
                                        {moment.utc(transaction.transaction_date * 1000).format('YYYY-MM-DD HH:mm:ss')}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        is stable
                                    </td>
                                    <td>
                                        {this.getBoolLabel(transaction.is_stable)} ({transaction.stable_date && moment.utc(transaction.stable_date * 1000).format('YYYY-MM-DD HH:mm:ss')})
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        status
                                    </td>
                                    <td>
                                        {transaction.status}
                                    </td>
                                </tr>

                                <tr>
                                    <td className={'w-20'}>
                                        node id origin
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
                                </tbody>
                            </Table>

                            <div className={'mb-3'}>
                                <div className={'section_subtitle'}>
                                    input list
                                </div>
                                <DatatableView
                                    value={transaction_input_list}
                                    sortField={'input_position'}
                                    sortOrder={1}
                                    showActionColumn={true}
                                    resultColumn={[
                                        {
                                            'field': 'input_position'
                                        },
                                        {
                                            'field': 'output_transaction_id'
                                        },
                                        {
                                            'field': 'output_position'
                                        },
                                        {
                                            'field': 'output_transaction_date'
                                        },
                                        {
                                            'field': 'is_double_spend'
                                        },
                                        {
                                            'field': 'double_spend_date'
                                        },
                                        {
                                            'field': 'is_stable'
                                        },
                                        {
                                            'field': 'stable_date'
                                        },
                                        {
                                            'field': 'status'
                                        }
                                    ]}/>
                            </div>

                            <div className={'section_subtitle'}>
                                output list
                            </div>
                            <DatatableView
                                value={transaction_output_list}
                                sortField={'output_position'}
                                sortOrder={1}
                                resultColumn={[
                                    {
                                        'field': 'address'
                                    },
                                    {
                                        'field': 'output_position'
                                    },
                                    {
                                        'field': 'amount'
                                    },
                                    {
                                        'field': 'is_double_spend'
                                    },
                                    {
                                        'field': 'double_spend_date'
                                    },
                                    {
                                        'field': 'is_stable'
                                    },
                                    {
                                        'field': 'stable_date'
                                    },
                                    {
                                        'field': 'status'
                                    }
                                ]}/>
                        </div>
                    </div>
                </Col>
            </>
        );
    }
}


export default connect(
    state => ({
        transaction: state.transactionDetails
    }),
    {
        clearTransactionDetails,
        updateTransactionDetails
    })(withRouter(TransactionDetailsView));
