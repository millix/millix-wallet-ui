import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as format from '../../helper/format';
import * as validate from '../../helper/validate';
import ModalView from './../utils/modal-view';
import * as text from '../../helper/text';
import API from '../../api';
import ErrorList from './../utils/error-list-view';
import Transaction from '../../common/transaction';
import HelpIconView from '../utils/help-icon-view';
import {changeLoaderState} from '../loader';
import ReactChipInput from 'react-chip-input';
import Translation from '../../common/translation';
import {TRANSACTION_DATA_TYPE_MESSENGER} from '../../../config';


class MessageComposeForm extends Component {
    constructor(props) {
        super(props);
        const propsState    = props.location.state || {};
        const address_value = propsState.sent ? propsState.address_to : propsState.address_from;

        let message_body = '';
        if (propsState.message) {
            let reply_to_message_body = propsState.message;
            message_body              = `\n\n______________________________\nOn ${propsState.date} ${address_value} wrote:\n\n${reply_to_message_body}`;
        }

        this.state = {
            sending                 : false,
            dns_valid               : false,
            dns_validating          : false,
            fee_input_locked        : true,
            error_list              : [],
            modal_show_confirmation : false,
            modal_show_send_result  : false,
            modal_body_send_result  : [],
            address_base            : '',
            address_version         : '',
            address_key_identifier  : '',
            amount                  : '',
            fee                     : '',
            destination_address_list: address_value ? [address_value] : [],
            subject                 : propsState.subject ? this.getReplySubjectText(propsState.subject) : '',
            message                 : message_body,
            txid                    : propsState.txid
        };

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
        clearTimeout(this.checkDNSHandler);
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.message && this.state.message === Translation.getPhrase('09959a949')) {
            this.populateFormFromProps();
        }
    }

    componentDidMount() {
        let amount_default = 10000;
        if (this.props.amount) {
            amount_default = this.props.amount;
        }
        this.amount.value = format.millix(amount_default, false);

        if (this.props.message) {
            this.populateFormFromProps();
        }
    }

    populateFormFromProps() {
        this.setState({
            message                 : this.props.message,
            subject                 : this.props.subject,
            destination_address_list: [this.props.destination_address]
        });
    }

    getReplySubjectText(subject) {
        if (subject.indexOf('re:') !== 0) {
            subject = `re: ${subject}`;
        }
        return subject;
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

        const transaction_param = {
            address_list: validate.required(Translation.getPhrase('34e691203'), this.state.destination_address_list, error_list),
            amount      : validate.amount(Translation.getPhrase('908073a53'), this.amount.value, error_list),
            fee         : validate.amount(Translation.getPhrase('5d5997bf3'), this.fee.value, error_list),
            subject     : this.subject.value,
            message     : this.message.value,
            dns         : validate.domain_name(Translation.getPhrase('7ea14bda1'), this.dns.value, error_list)
        };

        if (error_list.length === 0) {
            validate.verified_sender_domain_name(transaction_param.dns, this.props.wallet.address_key_identifier).then(result => {
                if (result.valid) {
                    Transaction.verifyAddress(transaction_param).then((data) => {
                        this.setState(data);
                        this.changeModalShowConfirmation();
                    }).catch((error) => {
                        error_list.push(error);

                        this.setState({
                            error_list: error_list
                        });
                    });
                }
                else {
                    this.setState({
                        error_list: result.error_list
                    });
                }
            });
        }

        this.setState({
            error_list: error_list
        });
    }

    validateDns(e) {
        this.setState({
            dns_valid     : false,
            dns_validating: true
        });
        clearTimeout(this.checkDNSHandler);
        this.checkDNSHandler = setTimeout(() => {
            validate.verified_sender_domain_name(e.target.value, this.props.wallet.address_key_identifier).then(result => {//verified sender domain name
                this.setState({
                    error_list    : result.error_list,
                    dns_valid     : result.valid,
                    dns_validating: false
                });
            });
        }, 500);
    }

    sendTransaction() {
        changeLoaderState(true);
        this.setState({
            sending: true
        });
        let transaction_output_payload = this.prepareTransactionOutputPayload();
        Transaction.sendTransaction(transaction_output_payload, true).then((data) => {
            this.clearSendForm();
            this.changeModalShowConfirmation(false);
            this.changeModalShowSendResult();
            this.setState(data);
            changeLoaderState(false);
        }).catch((error) => {
            this.changeModalShowConfirmation(false);
            this.setState(error);
            changeLoaderState(false);
        });
    }

    clearSendForm() {
        this.destination_address_list = [];
        this.amount.value             = '';
        this.subject.value            = '';
        this.message.value            = '';

        if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
            this.fee.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
        }
    }

    prepareTransactionOutputPayload() {
        const transactionOutputAttribute = {};

        if (!!this.state.dns) {
            transactionOutputAttribute['dns'] = this.state.dns;
        }
        if (!!this.state.txid) {
            transactionOutputAttribute['parent_transaction_id'] = this.state.txid;
        }

        return {
            transaction_output_attribute: transactionOutputAttribute,
            transaction_data            : {
                subject: this.state.subject,
                message: this.state.message
            },
            transaction_data_type       : TRANSACTION_DATA_TYPE_MESSENGER,
            transaction_output_list     : this.state.address_list.map(address => ({
                address_base          : address.address_base,
                address_version       : address.address_version,
                address_key_identifier: address.address_key_identifier,
                amount                : this.state.amount
            })),
            transaction_output_fee      : {
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

    addDestinationAddress(value) {
        const chips = this.state.destination_address_list.slice();
        value.split(/[\n ]/).forEach(address => {
            if (chips.includes(address.trim())) {
                this.setState({
                    error_list: [
                        {
                            name   : 'recipient_already_exist',
                            message: Translation.getPhrase('cf02f25db') + ` ${address.trim()}`
                        }
                    ]
                });
                return;
            }
            chips.push(address.trim());
        });

        this.setState({destination_address_list: chips});
    };

    removeDestinationAddress(index) {
        const chips = this.state.destination_address_list.slice();
        chips.splice(index, 1);
        this.setState({destination_address_list: chips});
    };

    getFieldClassname(field) {
        return this.props.hidden_field_list?.includes(field) ? 'd-none' : '';
    }

    render() {
        return (<>
            <ErrorList
                error_list={this.state.error_list}/>
            <Row className={'message_compose'}>
                <Col className={this.getFieldClassname('address')}>
                    <Form.Group className="form-group" role="form">
                        <label>{Translation.getPhrase('6ee1a646f')}</label>
                        <ReactChipInput
                            ref={ref => {
                                if (ref && !ref.state.focused && ref.formControlRef.current.value !== '') {
                                    this.addDestinationAddress(ref.formControlRef.current.value);
                                    ref.formControlRef.current.value = '';
                                }
                                if (!this.chipInputAddress) {
                                    ref.formControlRef.current.placeholder = Translation.getPhrase('6ee1a646f');
                                    this.chipInputAddress                  = ref;
                                }
                            }}
                            classes="chip_input form-control"
                            chips={this.state.destination_address_list}
                            onSubmit={value => this.addDestinationAddress(value)}
                            onRemove={index => this.removeDestinationAddress(index)}
                        />
                    </Form.Group>
                </Col>
                <Form>
                    <Col className={this.getFieldClassname('subject')}>
                        <Form.Group className="form-group">
                            <label>{Translation.getPhrase('5c4428695')}</label>
                            <Form.Control type="text"
                                          value={this.state.subject}
                                          onChange={c => this.setState({subject: c.target.value})}
                                          placeholder={Translation.getPhrase('5c4428695')}
                                          ref={c => this.subject = c}/>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="form-group">
                            <label>{this.props.input_label_message ? this.props.input_label_message : Translation.getPhrase('70fd6e7fc')}</label>
                            <Form.Control as="textarea" rows={10}
                                          value={this.state.message}
                                          onChange={c => this.setState({message: c.target.value})}
                                          placeholder={Translation.getPhrase('70fd6e7fc')}
                                          autoFocus
                                          ref={c => {
                                              this.message = c;
                                          }}/>
                        </Form.Group>
                    </Col>
                    <Col className={this.getFieldClassname('amount')}>
                        <Form.Group className="form-group">
                            <label>{Translation.getPhrase('6997ec114')}<HelpIconView help_item_name={'message_payment'}/></label>
                            <Form.Control type="text"
                                          placeholder={Translation.getPhrase('5227c5387')}
                                          pattern="[0-9]+([,][0-9]{1,2})?"
                                          ref={c => this.amount = c}
                                          onChange={validate.handleAmountInputChange.bind(this)}/>
                        </Form.Group>
                    </Col>
                    <Col className={this.getFieldClassname('fee')}>
                        <Form.Group className="form-group"
                                    as={Row}>
                            <label>{Translation.getPhrase('e957d8d6f')}</label>
                            <Col className={'input-group'}>
                                <Form.Control type="text"
                                              placeholder={Translation.getPhrase('e957d8d6f')}
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
                    <Col className={this.getFieldClassname('verified_sender')}>
                        <Form.Group className="form-group"
                                    as={Row}>
                            <label>{Translation.getPhrase('68c04bec8')}<HelpIconView help_item_name={'verified_sender'}/></label>
                            <Col className={'input-group'}>
                                <Form.Control type="text"
                                              placeholder={Translation.getPhrase('973c2c6a3')}
                                              pattern="^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"
                                              ref={c => this.dns = c}
                                              onChange={e => {
                                                  validate.handleDomainNameInputChange(e);
                                                  this.validateDns(e);
                                              }}/>
                                {this.state.dns_validating ? <button
                                    className="btn btn-outline-input-group-addon loader icon_only"
                                    type="button"
                                    disabled={true}>
                                    <div className="loader-spin"/>
                                </button> : ''}
                            </Col>
                            {this.state.dns_valid && this.dns?.value !== '' ? <div className={'text-success labeled verified_sender_mark'}>
                                <FontAwesomeIcon
                                    icon={'check-circle'}
                                    size="1x"/>
                                <span>{this.dns.value}</span>
                            </div> : ''}
                        </Form.Group>
                    </Col>
                    <Col
                        className={'d-flex justify-content-center'}>
                        <ModalView
                            show={this.state.modal_show_confirmation}
                            size={'lg'}
                            heading={Translation.getPhrase('232eb13bb')}
                            on_accept={() => this.sendTransaction()}
                            on_close={() => this.cancelSendTransaction()}
                            body={<div>
                                <div>{Translation.getPhrase('11da3c1c9', {millix_amount: format.millix(this.state.amount)})}</div>
                                <div>{this.state.address_base}{this.state.address_version}{this.state.address_key_identifier}</div>
                                {text.get_confirmation_modal_question()}
                            </div>}/>
                        <ModalView
                            show={this.state.modal_show_send_result}
                            size={'lg'}
                            on_close={() => this.changeModalShowSendResult(false)}
                            heading={Translation.getPhrase('3ff3dba19')}
                            body={this.state.modal_body_send_result}/>
                        <Form.Group as={Row}>
                            <Button
                                variant="outline-primary"
                                style={{
                                    zIndex: 99999
                                }}
                                className={'btn_loader'}
                                onClick={() => this.send()}
                                disabled={this.state.canceling || this.state.dns_validating}>
                                {this.state.sending ? <>
                                    <div className="loader-spin"/>
                                    {this.state.canceling ? Translation.getPhrase('545fb12eb') : Translation.getPhrase('4498f50c0')}
                                </> : <>{Translation.getPhrase('fc58d259a')}</>}
                            </Button>
                        </Form.Group>
                    </Col>
                </Form>
            </Row>
        </>);
    }
}


export default connect(state => ({
    wallet: state.wallet,
    config: state.config
}))(withRouter(MessageComposeForm));
