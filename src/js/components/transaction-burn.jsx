import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import ErrorList from './utils/error-list-view';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';
import * as validate from '../helper/validate';
import * as text from '../helper/text';
import Transaction from '../common/transaction';
import Translation from '../common/translation';
import Web3 from 'web3';
import MetamaskInstall from './utils/metamask-install-view';


class TransactionBurnView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ethereum_address       : undefined,
            wmlx_balance           : undefined,
            fee_input_locked       : true,
            loaded                 : false,
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

        const miniABI  = [
            // balanceOf
            {
                constant: true,

                inputs: [
                    {
                        name: '_owner',
                        type: 'address'
                    }
                ],

                name: 'balanceOf',

                outputs: [
                    {
                        name: 'balance',
                        type: 'uint256'
                    }
                ],

                type: 'function'
            },
            {
                inputs         : [],
                name           : 'burnFees',
                outputs        : [
                    {
                        internalType: 'uint32',
                        name        : '',
                        type        : 'uint32'
                    }
                ],
                stateMutability: 'view',
                constant       : true,
                type           : 'function'
            },
            {
                inputs         : [
                    {
                        internalType: 'uint256',
                        name        : 'amount',
                        type        : 'uint256'
                    },
                    {
                        internalType: 'string',
                        name        : 'to',
                        type        : 'string'
                    }
                ],
                name           : 'unwrap',
                outputs        : [],
                stateMutability: 'payable',
                type           : 'function',
                payable        : true
            }

        ];
        this.bridgeFee = undefined;
        this.millixFee = 1000000;

        if (window.ethereum) {
            this.web3         = new Web3(window.ethereum);
            this.wmlxContract = new this.web3.eth.Contract(miniABI, '0x2C9d6465aaDa86421A9CF5cAD030fEF3de93c5aD');
        }

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
    }

    componentDidMount() {
        if (window.ethereum) {
            window.ethereum.request({method: 'eth_accounts'}).then(data => this._loadEthereumAddress(data[0]))
                  .catch(_ => _)
                  .then(_ => this.setState({loaded: true}));
            return;
        }

        this.setState({loaded: true});
    }

    connectEthereumWallet() {
        window.ethereum && window.ethereum.request({method: 'eth_requestAccounts'})
                                 .then(data => this._loadEthereumAddress(data[0]))
                                 .catch(_ => _);
    }

    _loadEthereumAddress(address) {
        return this.wmlxContract.methods.burnFees().call()
                   .then(burnFees => {
                       try {
                           this.bridgeFee = parseInt(burnFees);
                       }
                       catch (e) {
                       }
                       return this.wmlxContract.methods.balanceOf(address).call()
                                  .then(wmlxBalance => this.setState({
                                      wmlx_balance    : wmlxBalance,
                                      ethereum_address: address
                                  }));
                   })
                   .catch(_ => _);
    }

    send() {
        let error_list = [];
        if (this.state.sending) {
            return;
        }

        const transactionParams = {
            address  : validate.required(Translation.getPhrase('c9861d7c2'), this.destinationAddress.value, error_list),
            amount   : validate.amount(Translation.getPhrase('cdfa46e99'), this.amount.value, error_list),
            millixFee: validate.integerPositive(Translation.getPhrase('3ae48ceb8'), this.millixFee.toString(), error_list),
            bridgeFee: validate.integerPositive('ethereum bridge fee', this.bridgeFee ?? '', error_list)
        };

        if (error_list.length === 0) {
            this.setState(transactionParams);
            this.changeModalShowConfirmation();
        }

        this.setState({
            error_list: error_list
        });
    }

    sendTransaction() {
        this.setState({
            sending: true
        });

        this.wmlxContract.methods.unwrap(this.state.amount, this.state.address)
            .send({
                from : this.state.ethereum_address,
                value: this.state.bridgeFee
            })
            .then(data => {
                this.clearSendForm();
                this.changeModalShowConfirmation(false);
                this.changeModalShowSendResult();
                this.setState({
                    sending               : false,
                    modal_body_send_result: Transaction.getModalBodySuccessResult(data.transactionHash)
                });
            })
            .catch(() => {
                this.changeModalShowConfirmation(false);
                this.setState({sending: false});
            });
    }

    clearSendForm() {
        this.destinationAddress.value = '';
        this.amount.value             = '';
        this._loadEthereumAddress(this.state.ethereum_address);
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
        if (!this.state.loaded) {
            return null;
        }

        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body balance_panel'}>
                        <div className={'balance_container'}>
                            <div className={'stable_millix'}>
                                <span>{!this.state.ethereum_address ? 'burn wrapped millix' : this.state.wmlx_balance + ' WMLX'}</span>
                            </div>
                        </div>
                        <hr className={'w-100'}/>
                        <div
                            className={'primary_address'}>
                            {window.ethereum ? (!this.state.ethereum_address ? <Button
                                variant="outline-primary"
                                className={'btn_loader'}
                                onClick={() => this.connectEthereumWallet()}>
                                connect wallet
                            </Button> : this.state.ethereum_address) : <MetamaskInstall/>}
                        </div>
                    </div>
                </div>
                {window.ethereum && this.state.ethereum_address && <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>burn wmlx</div>
                    <div className={'panel-body'}>
                        <p>
                            use this form to send wrapped millix (WMLX) to the millix network (MLX). 1 wrapped millix = 1 million millix. there is an
                            ethereum network fee to send wmlx to the bridge and a millix network fee to send the millix from the bridge to the destination
                            address.
                        </p>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>destination address in the millix network</label>
                                        <Form.Control type="text"
                                                      placeholder={Translation.getPhrase('c9861d7c2')}
                                                      ref={c => this.destinationAddress = c}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>wmlx amount</label>
                                        <Form.Control type="text"
                                                      placeholder={Translation.getPhrase('cdfa46e99')}
                                                      pattern="[0-9]+([,][0-9]{1,2})?"
                                                      ref={c => this.amount = c}
                                                      onChange={validate.handleAmountInputChange.bind(this)}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>bridge fee (gwei)</label>
                                        <Form.Control type="text"
                                                      value={format.number(this.bridgeFee)}
                                                      disabled={true}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>millix network fee (mlx)</label>
                                        <Form.Control type="text"
                                                      value={format.number(this.millixFee)}
                                                      disabled={true}/>
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
                                            <div>{`you are about to burn and send ${format.wMillix(this.state.amount)} to the millix address ${this.state.address}`}</div>
                                            <div>this transaction will cost
                                                you {format.number(this.bridgeFee)} ether and {format.millix(this.millixFee)} in fees
                                            </div>
                                            <div>you will receive {format.millix(this.state.amount * 1000000 - this.millixFee)} in the destination address</div>
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
                </div>}
            </>
        );
    }
}


export default connect(
    state => ({
        wallet               : state.wallet,
        config               : state.config,
        currency_pair_summary: state.currency_pair_summary
    }))(withRouter(TransactionBurnView));
