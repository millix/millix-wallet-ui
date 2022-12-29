import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row, Form, Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../../api';
import ErrorList from '../utils/error-list-view';
import ModalView from '../utils/modal-view';
import * as format from '../../helper/format';
import * as validate from '../../helper/validate';
import * as text from '../../helper/text';
import Transaction from '../../common/transaction';
import Translation from '../../common/translation';
import web3 from 'web3';
import MetamaskInstall from '../utils/metamask-install-view';
import Web3 from 'web3';


class TransactionMintView extends Component {
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

        this.bridgeFee = 1000000;
        this.send      = this.send.bind(this);

        if (window.ethereum) {
            this.web3 = new Web3(window.ethereum);
        }
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

        const transactionParams = {
            address: validate.required(Translation.getPhrase('c9861d7c2'), this.destinationAddress.value, error_list),
            amount : validate.amount(Translation.getPhrase('cdfa46e99'), this.amount.value, error_list),
            fee    : validate.amount(Translation.getPhrase('3ae48ceb8'), this.fee.value, error_list)
        };

        if (!web3.utils.isAddress(transactionParams.address)) {
            error_list.push({
                name   : 'address',
                message: `the destination address in the ethereum network is not valid`
            });
        }

        if (!this.web3) {
            error_list.push({
                name   : 'metamask',
                message: `metamask is not installed`
            });
        }

        if (error_list.length === 0) {
            this.web3.eth.getBalance(transactionParams.address)
                .then(balance => {
                    this.setState(transactionParams);

                    if (parseInt(balance) === 0) {
                        this.changeModalShowZeroBalanceWarning();
                    }
                    else {
                        this.changeModalShowConfirmation();
                    }
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
            transaction_output_list     : [
                {
                    amount: amount * 1000000
                },
                {
                    amount: this.bridgeFee
                }
            ],
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : this.state.fee
            },
            transaction_output_attribute: {
                bridge_mapping: {
                    network: 'ethereum',
                    address: this.state.address
                }
            },
            version                     : this.props.config.BRIDGE_TRANSACTION_VERSION_MINT
        };
    }

    cancelSendTransaction() {
        this.setState({
            canceling              : false,
            sending                : false,
            modal_show_mint_warning: false
        });
        this.changeModalShowConfirmation(false);
    }

    changeModalShowConfirmation(value = true) {
        this.setState({
            modal_show_confirmation: value
        });
    }

    changeModalShowZeroBalanceWarning(value = true) {
        this.setState({
            modal_show_mint_warning: value
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modal_show_send_result: value
        });
    }

    render() {
        return <div className={'panel panel-filled'}>
            <div className={'panel-heading bordered'}>send to exchange</div>
            <div className={'panel-body'}>
                {window.ethereum ?
                 <>
                     <p>
                         use this form to send millix (mlx) to the ethereum network as wrapped millix (wmlx). there is a
                         millix network fee to send millix to the bridge and an ethereum network fee to send the wmlx from the bridge to the
                         destination
                         address.
                     </p>
                     <ErrorList
                         error_list={this.state.error_list}/>
                     <Form>
                         <Form.Group className="form-group">
                             <label>destination address in the ethereum network</label>
                             <Form.Control type="text"
                                           placeholder={Translation.getPhrase('c9861d7c2')}
                                           ref={c => this.destinationAddress = c}/>
                         </Form.Group>

                         <div className={'d-flex mb-2'}>
                             <Form.Group className={'flex-fill me-3'}>
                                 <label>wmlx amount</label>
                                 <Form.Control type="text"
                                               placeholder={Translation.getPhrase('cdfa46e99')}
                                               pattern="[0-9]+([,][0-9]{1,2})?"
                                               ref={c => this.amount = c}
                                               onChange={validate.handleAmountInputChange.bind(this)}/>
                             </Form.Group>

                             <Form.Group className="flex-fill">
                                 <label>mlx amount</label>
                                 <Form.Control type="text"
                                               value={this.amount?.value ? format.millix(this.amount?.value.replaceAll(',', '') * 1000000) : 0}
                                               disabled={true}/>
                             </Form.Group>
                         </div>
                         <div className={'text-white text-center'}>
                             1 wmlx = 1,000,000 mlx
                         </div>

                         <Form.Group className="form-group">
                             <label>bridge fee (mlx)</label>
                             <Form.Control type="text"
                                           value={format.number(this.bridgeFee)}
                                           disabled={true}/>
                         </Form.Group>
                         <Form.Group className="form-group"
                                     as={Row}>
                             <label>millix network fee (mlx)</label>
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
                         <ModalView
                             show={this.state.modal_show_confirmation}
                             size={'lg'}
                             heading={Translation.getPhrase('d469333b4')}
                             on_accept={() => this.sendTransaction()}
                             on_close={() => this.cancelSendTransaction()}
                             body={<div>
                                 <div>{`you are about to mint and send ${format.wMillix(this.state.amount)} to the ethereum address ${this.state.address}`}</div>
                                 <div>this transaction will cost
                                     you {format.millix(this.state.amount * 1000000 + this.bridgeFee + this.state.fee)}</div>
                                 {text.get_confirmation_modal_question()}
                             </div>}/>

                         <ModalView
                             show={this.state.modal_show_send_result}
                             size={'lg'}
                             on_close={() => this.changeModalShowSendResult(false)}
                             heading={Translation.getPhrase('54bb1b342')}
                             body={this.state.modal_body_send_result}/>

                         <ModalView
                             show={this.state.modal_show_mint_warning}
                             size={'lg'}
                             heading={Translation.getPhrase('d469333b4')}
                             on_accept={() => {
                                 this.changeModalShowZeroBalanceWarning(false);
                                 this.changeModalShowConfirmation();
                             }}
                             on_close={() => this.cancelSendTransaction()}
                             body={<div>
                                 <div>The address you are sending Wrapped Millix to does not have any Ethereum. Ethereum is required to pay
                                     transaction fees on the Ethereum blockchain. Without Ethereum you will not be able to trade Wrapped
                                     Millix on
                                     defi exchanges or send the Wrapped Millix to any other address, including your own addresses. The Wrapped
                                     Millix will be stuck on your Ethereum address until you have Ethereum.
                                 </div>
                                 {text.get_confirmation_modal_question()}
                             </div>}/>

                         <div className={'text-center'}>
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
                         </div>
                     </Form>
                 </>
                                 :
                 <MetamaskInstall/>
                }
            </div>
        </div>;
    }
}


export default connect(
    state => ({
        wallet               : state.wallet,
        config               : state.config,
        currency_pair_summary: state.currency_pair_summary
    }))(withRouter(TransactionMintView));
