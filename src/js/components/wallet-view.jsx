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
import * as validate from '../helper/validate';


class WalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feeInputLocked        : true,
            error_list            : [],
            modalShow             : false,
            modalShowSendResult   : false,
            modalBodySendResult   : [],
            address_base          : '',
            address_version       : '',
            address_key_identifier: '',
            amount                : '',
            fee                   : ''
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

        this.setState({
            sendTransactionError       : false,
            sendTransactionErrorMessage: null
        });

        const address = validate.required('address', this.destinationAddress.value, error_list);
        const amount  = validate.amount('amount', this.amount.value, error_list);
        const fee     = validate.amount('fee', this.fee.value, error_list);

        this.setState({
            error_list: error_list
        });

        if (error_list.length === 0) {
            API.verifyAddress(address)
               .then(data => {
                   if (!data.is_valid) {
                       error_list.push({
                           name   : 'address_invalid',
                           message: 'valid address is required'
                       });
                       this.setState({error_list: error_list});
                   }
                   else {
                       const {
                                 address_base          : destinationAddress,
                                 address_key_identifier: destinationAddressIdentifier,
                                 address_version       : destinationAddressVersion
                             } = data;

                       this.setState({
                           error_list            : [],
                           address_base          : destinationAddress,
                           address_version       : destinationAddressVersion,
                           address_key_identifier: destinationAddressIdentifier,
                           amount                : amount,
                           fee                   : fee
                       });

                       this.changeModalShow();
                   }
               });
        }
    }

    sendTransaction() {
        this.setState({
            sending: true
        });

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
                amount  : this.state.fee
            }
        }).then(data => {
            if (data.api_status === 'fail') {
                this.changeModalShow(false);

                return Promise.reject(data);
            }

            return data;
        }).then(data => {
            this.destinationAddress.value = '';
            this.amount.value             = '';

            if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                this.fee.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
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
                feeInputLocked     : true,
                modalBodySendResult: modalBodySendResult
            });
            this.changeModalShowSendResult();
        }).catch((e) => {
            let sendTransactionErrorMessage;
            let error_list = [];
            if (e !== 'validation_error') {
                if (e.api_message) {
                    sendTransactionErrorMessage = this.getUiError(e.api_message);
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
            this.changeModalShow(false);
        });
    }

    getUiError(api_message) {
        let error          = '';
        let api_error_name = 'unknown';

        if (typeof (api_message) === 'object') {
            let result_error = api_message.error;
            api_error_name   = result_error.error;

            switch (api_error_name) {
                case 'transaction_input_max_error':
                    error = <>your
                        transaction tried to use too many outputs<HelpIconView help_item_name={'transaction_max_input_number'}/>.
                        please try to send a smaller amount or aggregate manually by sending a smaller
                        amounts to yourself. the max amount you can send is {format.millix(result_error.data.amount_max)}.</>;
                    break;
                case 'insufficient_balance':
                    error = <>your balance is lower than the amount you are trying to send. the max amount you can send
                        is {format.millix(result_error.data.balance_stable)}.</>;
                    break;
                case 'transaction_send_interrupt':
                    error = <>transaction has been canceled.</>;
                    break;
                case 'proxy_not_found':
                    error = <>proxy not found. please try again.</>;
                    break;
                case 'transaction_proxy_rejected':
                    error = <>transaction rejected by a proxy. please try again.</>;
                    break;
                default:
                    break;
            }
        }
        else if (typeof (api_message) === 'string') {
            const match = /unexpected generic api error: \((?<message>.*)\)/.exec(api_message);
            error       = `your transaction could not be sent: (${match.groups.message})`;
        }

        return error;
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
                                                                      this.fee = c;
                                                                      if (this.fee && !this.feeInitialized && this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                                                                          this.feeInitialized = true;
                                                                          this.fee.value      = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
                                                                      }
                                                                  }}
                                                                  onChange={this.handleAmountValueChange.bind(this)}
                                                                  disabled={this.state.feeInputLocked}/>
                                                    <button
                                                        className="btn btn-outline-input-group-addon icon_only"
                                                        type="button"
                                                        onClick={() => this.setState({feeInputLocked: !this.state.feeInputLocked})}>
                                                        <FontAwesomeIcon
                                                            icon={this.state.feeInputLocked ? 'lock' : 'lock-open'}
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
