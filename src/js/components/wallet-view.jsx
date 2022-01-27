import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row, Form, Table, Button, Badge} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import ErrorList from './utils/error-list-view';
import HelpIconView from './utils/help-icon-view';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';
import BalanceView from './utils/balance-view';
import AddressListView from './address-list-view';


class WalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feesLocked            : true,
            error_list            : [],
            modalShow             : false,
            modalShowSendResult   : false,
            modalBodySendResult   : [],
            address_base          : '',
            address_version       : '',
            address_key_identifier: '',
            amount                : '',
            fees                  : ''
        };

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    _getAmount(value, allowZero = false) {
        const pValue = parseInt(value.replace(/[,.]/g, ''));
        if ((allowZero ? pValue < 0 : pValue <= 0) || format.millix(pValue, false) !== value) {
            throw Error('invalid_value');
        }
        return pValue;
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

        this.setState({
            sendTransactionError       : false,
            sendTransactionErrorMessage: null
        });

        API.verifyAddress(this.destinationAddress.value.trim())
           .then(data => {
               if (!data.is_valid) {
                   error_list.push({
                       name   : 'address_error',
                       message: 'invalid address'
                   });
                   this.setState({error_list: error_list});
                   return Promise.reject('validation_error');
               }

               const {
                         address_base          : destinationAddress,
                         address_key_identifier: destinationAddressIdentifier,
                         address_version       : destinationAddressVersion
                     } = data;

               let amount;
               try {
                   amount = this._getAmount(this.amount.value);
               }
               catch (e) {
                   error_list.push({
                       name   : 'amountError',
                       message: 'invalid amount'
                   });
                   this.setState({
                       error_list: error_list
                   });
                   return Promise.reject('validation_error');
               }

               let fees;
               try {
                   fees = this._getAmount(this.fees.value, true);
               }
               catch (e) {
                   error_list.push({
                       name   : 'feeError',
                       message: 'invalid fee. please, set a correct value.'
                   });
                   this.setState({
                       error_list: error_list
                   });
                   return Promise.reject('validation_error');
               }

               this.setState({
                   error_list            : [],
                   sending               : true,
                   address_base          : destinationAddress,
                   address_version       : destinationAddressVersion,
                   address_key_identifier: destinationAddressIdentifier,
                   amount                : amount,
                   fees                  : fees
               });

               this.changeModalShow();
           });
    }

    sendTransaction() {
        const amount = this.state.amount;
        API.sendTransaction({
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
                amount  : this.state.fees
            }
        }).then(data => {
            if (data.api_status === 'fail') {
                return Promise.reject(data);
            }

            return data;
        }).then(data => {
            this.destinationAddress.value = '';
            this.amount.value             = '';

            if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                this.fees.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
            }

            const transaction = data.transaction.find(item => {
                return item.version.indexOf('0a') !== -1;
            });

            const modalBodySendResult = <div className={'text-center'}>
                <div>
                    transaction id
                </div>
                <div>
                    {transaction.transaction_id}
                </div>
            </div>;

            this.setState({
                sending            : false,
                feesLocked         : true,
                modalBodySendResult: modalBodySendResult
            });
            this.changeModalShowSendResult();
        }).catch((e) => {
            let sendTransactionErrorMessage;
            let error_list = [];
            if (e !== 'validation_error') {
                if (e.api_message) {
                    if (typeof (e.api_message) === 'string') {
                        const match                 = /unexpected generic api error: \((?<message>.*)\)/.exec(e.api_message);
                        sendTransactionErrorMessage = `your transaction could not be sent: (${match.groups.message})`;
                    }
                    else {
                        if (typeof (e.api_message.error) !== 'undefined') {
                            const error = e.api_message.error;
                            if (error.error === 'transaction_input_max_error') {
                                sendTransactionErrorMessage = <>your
                                    transaction tried to use too many
                                    outputs<HelpIconView
                                        help_item_name={'transaction_max_input_number'}/>.
                                    please try to send a smaller amount or
                                    aggregate manually by sending a smaller
                                    amounts to yourself. the max amount you
                                    can
                                    send
                                    is {format.millix(error.data.amount_max)}</>;
                            }
                        }
                    }
                }

                if (e === 'insufficient_balance' || e.api_message.error.error === 'insufficient_balance') {
                    sendTransactionErrorMessage = 'your transaction could not be sent: insufficient millix balance';
                }
                else if (e === 'transaction_send_interrupt' || e.api_message.error === 'transaction_send_interrupt') {
                    sendTransactionErrorMessage = 'your transaction could not be sent: your transaction was canceled';
                }
                else {
                    sendTransactionErrorMessage = `your transaction could not be sent: (${e.api_message.error.error || e.api_message.error || e.message || e.api_message || e})`;
                }

                error_list.push({
                    name   : 'sendTransactionError',
                    message: sendTransactionErrorMessage
                });
            }
            this.setState({
                error_list: error_list,
                sending   : false,
                canceling : false
            });
        });
    }

    cancelSendTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeModalShow(false);
    }

    handleAmountValueChange(e) {
        if (e.target.value.length === 0) {
            return;
        }

        let cursorStart = e.target.selectionStart,
            cursorEnd   = e.target.selectionEnd;
        let amount      = e.target.value.replace(/[,.]/g, '');
        let offset      = 0;
        if ((amount.length - 1) % 3 === 0) {
            offset = 1;
        }

        amount         = parseInt(amount);
        e.target.value = !isNaN(amount) ? format.millix(amount, false) : 0;

        e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modalShowSendResult: value
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <BalanceView
                            stable={this.props.wallet.balance_stable}
                            pending={this.props.wallet.balance_pending}
                            primary_address={this.props.wallet.address}
                        />
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>send</div>
                            <div className={'panel-body'}>
                                <ErrorList
                                    error_list={this.state.error_list}/>
                                <Row>
                                    <Form>
                                        <Col
                                            className={'d-flex justify-content-center'}>
                                            {this.state.sendTransactionError && (
                                                <div className={'form-error'}>
                                                    <span>{this.state.sendTransactionErrorMessage}</span>
                                                </div>)}
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>address</label>
                                                <Form.Control type="text"
                                                              placeholder="address"
                                                              ref={c => this.destinationAddress = c}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>amount</label>
                                                <Form.Control type="text"
                                                              placeholder="amount"
                                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                                              ref={c => this.amount = c}
                                                              onChange={this.handleAmountValueChange.bind(this)}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group"
                                                        as={Row}>
                                                <label>fee</label>
                                                <Col className={'input-group'}>
                                                    <Form.Control type="text"
                                                                  placeholder="fee"
                                                                  pattern="[0-9]+([,][0-9]{1,2})?"
                                                                  ref={c => {
                                                                      this.fees = c;
                                                                      if (this.fees && !this.feesInitialized && this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                                                                          this.feesInitialized = true;
                                                                          this.fees.value      = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
                                                                      }
                                                                  }}
                                                                  onChange={this.handleAmountValueChange.bind(this)}
                                                                  disabled={this.state.feesLocked}/>
                                                    <button
                                                        className="btn btn-outline-input-group-addon icon_only"
                                                        type="button"
                                                        onClick={() => this.setState({feesLocked: !this.state.feesLocked})}>
                                                        <FontAwesomeIcon
                                                            icon={this.state.feesLocked ? 'lock' : 'lock-open'}
                                                            size="sm"/>
                                                    </button>
                                                </Col>
                                            </Form.Group>
                                        </Col>
                                        <Col
                                            className={'d-flex justify-content-center'}>
                                            <ModalView
                                                show={this.state.modalShow}
                                                size={'lg'}
                                                heading={'send confirmation'}
                                                on_accept={() => this.sendTransaction()}
                                                on_close={() => this.cancelSendTransaction()}
                                                body={<div>you are about to
                                                    send {format.millix(this.state.amount)} to {this.state.address_key_identifier}{this.state.address_version}{this.state.address_base}.
                                                    <div>confirm that you want
                                                        to
                                                        continue.</div></div>}/>

                                            <ModalView
                                                show={this.state.modalShowSendResult}
                                                size={'lg'}
                                                on_close={() => this.changeModalShowSendResult(false)}
                                                heading={'payment has been sent'}
                                                body={this.state.modalBodySendResult}/>
                                            <Form.Group as={Row}>
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => this.send()}
                                                    disabled={this.state.canceling}>
                                                    {this.state.sending ?
                                                     <>
                                                         <div style={{
                                                             fontSize: '6px',
                                                             float   : 'left'
                                                         }}
                                                              className="loader-spin"/>
                                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                                     </> : <>send</>}
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    }))(withRouter(WalletView));
