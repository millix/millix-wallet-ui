import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row, Form, Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import ErrorList from './utils/error-list-view';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';
import BalanceView from './utils/balance-view';
import * as validate from '../helper/validate';
import * as text from '../helper/text';
import Transaction from '../common/transaction';
import Translation from '../common/translation';
import BackupReminderView from './education/backup-reminder-view';


class WalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fee_input_locked       : true,
            error_list             : [],
            modal_show_confirmation: false,
            modal_show_send_result : false,
            modal_body_send_result : [],
            address_base           : '',
            address_version        : '',
            address_key_identifier : '',
            amount                 : '',
            fee                    : ''
        };

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    send() {
        let error_list = [];
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
            this.setState({
                canceling: true
            });
            return;
        }

        const transaction_params = {
            address_list: [validate.required(Translation.getPhrase('c9861d7c2'), this.destinationAddress.value, error_list)],
            amount      : validate.amount(Translation.getPhrase('cdfa46e99'), this.amount.value, error_list),
            fee         : validate.amount(Translation.getPhrase('3ae48ceb8'), this.fee.value, error_list)
        };
        if (error_list.length === 0) {
            Transaction.verifyAddress(transaction_params).then((data) => {
                const addressList = data.address_list;
                delete data['address_list'];
                this.setState({...data, ...addressList[0]});
                this.changeModalShowConfirmation();
            }).catch((error) => {
                error_list.push(error);
            });
        }

        this.setState({
            error_list: error_list
        });
    }

    sendTransaction() {
        this.setState({
            sending: true
        });
        let transaction_output_payload = this.prepareTransactionOutputPayload();
        Transaction.sendTransaction(transaction_output_payload).then((data) => {
            this.clearSendForm();
            this.changeModalShowConfirmation(false);
            this.changeModalShowSendResult();
            this.setState(data);
        }).catch((error) => {
            this.changeModalShowConfirmation(false);
            this.setState(error);
        });
    }

    clearSendForm() {
        this.destinationAddress.value = '';
        this.amount.value             = '';

        if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
            this.fee.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
        }
    }

    prepareTransactionOutputPayload() {
        const amount = this.state.amount;
        return {
            transaction_output_list: [
                {
                    address_base          : this.state.address_base,
                    address_version       : this.state.address_version,
                    address_key_identifier: this.state.address_key_identifier,
                    amount
                }
            ],
            transaction_output_fee : {
                fee_type: 'transaction_fee_default',
                amount  : this.state.fee
            }
        };
    }

    cancelSendTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeModalShowConfirmation(false);
    }

    changeModalShowConfirmation(value = true) {
        this.setState({
            modal_show_confirmation: value
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modal_show_send_result: value
        });
    }

    render() {
        return (
            <>
                <BackupReminderView/>
                <BalanceView
                    stable={this.props.wallet.balance_stable}
                    pending={this.props.wallet.balance_pending}
                    primary_address={this.props.wallet.address}
                />
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>{Translation.getPhrase('2c2a681e8')}</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('c9861d7c2')}</label>
                                        <Form.Control type="text"
                                                      placeholder={Translation.getPhrase('c9861d7c2')}
                                                      ref={c => this.destinationAddress = c}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>{Translation.getPhrase('cdfa46e99')}</label>
                                        <Form.Control type="text"
                                                      placeholder={Translation.getPhrase('cdfa46e99')}
                                                      pattern="[0-9]+([,][0-9]{1,2})?"
                                                      ref={c => this.amount = c}
                                                      onChange={validate.handleAmountInputChange.bind(this)}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group"
                                                as={Row}>
                                        <label>{Translation.getPhrase('5d5997bf3')}</label>
                                        <Col className={'input-group'}>
                                            <Form.Control type="text"
                                                          placeholder={Translation.getPhrase('5d5997bf3')}
                                                          pattern="[0-9]+([,][0-9]{1,2})?"
                                                          ref={c => {
                                                              this.fee = c;
                                                              if (this.fee && !this.feeInitialized && this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                                                                  this.feeInitialized = true;
                                                                  this.fee.value      = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
                                                              }
                                                          }}
                                                          onChange={validate.handleAmountInputChange.bind(this)}
                                                          disabled={this.state.fee_input_locked}/>
                                            <button
                                                className="btn btn-outline-input-group-addon icon_only"
                                                type="button"
                                                onClick={() => this.setState({fee_input_locked: !this.state.fee_input_locked})}>
                                                <FontAwesomeIcon
                                                    icon={this.state.fee_input_locked ? 'lock' : 'lock-open'}/>
                                            </button>
                                        </Col>
                                    </Form.Group>
                                </Col>
                                <Col
                                    className={'d-flex justify-content-center'}>
                                    <ModalView
                                        show={this.state.modal_show_confirmation}
                                        size={'lg'}
                                        heading={Translation.getPhrase('d469333b4')}
                                        on_accept={() => this.sendTransaction()}
                                        on_close={() => this.cancelSendTransaction()}
                                        body={<div>
                                            <div>{Translation.getPhrase('6183562eb', {millix_amount: format.millix(this.state.amount)})}</div>
                                            <div>{this.state.address_base}{this.state.address_version}{this.state.address_key_identifier}</div>
                                            {text.get_confirmation_modal_question()}
                                        </div>}/>

                                    <ModalView
                                        show={this.state.modal_show_send_result}
                                        size={'lg'}
                                        on_close={() => this.changeModalShowSendResult(false)}
                                        heading={Translation.getPhrase('54bb1b342')}
                                        body={this.state.modal_body_send_result}/>
                                    <Form.Group as={Row}>
                                        <Button
                                            variant="outline-primary"
                                            className={'btn_loader'}
                                            onClick={() => this.send()}
                                            disabled={this.state.canceling}>
                                            {this.state.sending ?
                                             <>
                                                 <div className="loader-spin"/>
                                                 {this.state.canceling ? Translation.getPhrase('20b672040') : Translation.getPhrase('607120b8a')}
                                             </> : <>{Translation.getPhrase('2c2a681e8')}</>}
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Form>
                        </Row>
                    </div>
                </div>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet               : state.wallet,
        config               : state.config,
        currency_pair_summary: state.currency_pair_summary
    }))(withRouter(WalletView));
