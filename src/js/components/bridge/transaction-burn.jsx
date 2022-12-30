import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import ErrorList from '../utils/error-list-view';
import ModalView from '../utils/modal-view';
import * as format from '../../helper/format';
import * as validate from '../../helper/validate';
import * as text from '../../helper/text';
import Transaction from '../../common/transaction';
import Translation from '../../common/translation';
import Web3 from 'web3';
import MetamaskInstall from '../utils/metamask-install-view';
import {BRIDGE_ETH_CONTRACT_ADDRESS} from '../../../config';


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
            this.wmlxContract = new this.web3.eth.Contract(miniABI, BRIDGE_ETH_CONTRACT_ADDRESS);
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
            bridgeFee: validate.integerPositive(Translation.getPhrase('WTsbGfbpO'), this.bridgeFee ?? '', error_list)
        };

        if (true || error_list.length === 0) {
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

        let balance_panel = '';
        if (window.ethereum && this.state.ethereum_address) {
            balance_panel = <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body balance_panel'}>
                        <div className={'balance_container'}>
                            <div className={'stable_millix'}>
                                <span>{format.wMillix(this.state.wmlx_balance, false) + ' wmlx'}</span>
                            </div>
                        </div>
                        <hr className={'w-100'}/>
                        <div
                            className={'primary_address'}>
                            {this.state.ethereum_address}
                        </div>
                    </div>
                </div>
            </>;
        }

        return (
            <>
                {balance_panel}

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        {Translation.getPhrase('J0rheaCHm')}
                    </div>

                    <div className={'panel-body'}>
                        {window.ethereum ?
                         <>
                             {!this.state.ethereum_address &&
                              <div className={'text-center'}>
                                  <Button
                                      variant="outline-primary"
                                      className={'btn_loader'}
                                      onClick={() => this.connectEthereumWallet()}>
                                      {Translation.getPhrase('UCCkxAb45')}
                                  </Button>
                              </div>}
                         </>
                                         :
                         <MetamaskInstall/>}

                        {window.ethereum && this.state.ethereum_address || true && <>
                            <p>
                                {Translation.getPhrase('AOPVG6Hxf')}
                            </p>
                            <ErrorList
                                error_list={this.state.error_list}/>
                            <Form>
                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('mQtN7WGZq')}</label>
                                    <Form.Control type="text"
                                                  placeholder={Translation.getPhrase('c9861d7c2')}
                                                  ref={c => this.destinationAddress = c}/>
                                </Form.Group>


                                <div className={'d-flex mb-2'}>
                                    <Form.Group className={'flex-fill me-3'}>
                                        <label>{Translation.getPhrase('zl4TR8plF')}</label>
                                        <Form.Control type="text"
                                                      placeholder={Translation.getPhrase('cdfa46e99')}
                                                      pattern="[0-9]+([,][0-9]{1,2})?"
                                                      ref={c => this.amount = c}
                                                      onChange={validate.handleAmountInputChange.bind(this)}/>
                                    </Form.Group>

                                    <Form.Group className="flex-fill">
                                        <label>{Translation.getPhrase('RlfKIuDdA')}</label>
                                        <Form.Control type="text"
                                                      value={this.amount?.value ? format.millix(this.amount?.value.replaceAll(',', '') * 1000000) : 0}
                                                      disabled={true}/>
                                    </Form.Group>
                                </div>
                                <div className={'text-white text-center'}>
                                    1 wmlx = 1,000,000 mlx
                                </div>

                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('WvuvBjQWf', {
                                        ticker: 'gwei'
                                    })}</label>
                                    <Form.Control type="text"
                                                  value={format.number(this.bridgeFee)}
                                                  disabled={true}/>
                                </Form.Group>
                                <Form.Group className="form-group">
                                    <label>{Translation.getPhrase('oVNOGjnmA')}</label>
                                    <Form.Control type="text"
                                                  value={format.number(this.millixFee)}
                                                  disabled={true}/>
                                </Form.Group>
                                <ModalView
                                    show={this.state.modal_show_confirmation}
                                    size={'lg'}
                                    heading={Translation.getPhrase('d469333b4')}
                                    on_accept={() => this.sendTransaction()}
                                    on_close={() => this.cancelSendTransaction()}
                                    body={<div>
                                        <div>
                                            {Translation.getPhrase('p1ejhi09k', {
                                                amount : format.wMillix(this.state.amount),
                                                address: this.state.address
                                            })}
                                        </div>
                                        <div>
                                            {Translation.getPhrase('fi1Tikx6w', {
                                                amount_eth: format.number(this.bridgeFee),
                                                amount_mlx: format.millix(this.millixFee)
                                            })}
                                        </div>
                                        <div>
                                            {Translation.getPhrase('gjl82tOqW', {
                                                amount: format.millix(this.state.amount * 1000000 - this.millixFee)
                                            })}
                                        </div>
                                        {text.get_confirmation_modal_question()}
                                    </div>}/>

                                <ModalView
                                    show={this.state.modal_show_send_result}
                                    size={'lg'}
                                    on_close={() => this.changeModalShowSendResult(false)}
                                    heading={Translation.getPhrase('54bb1b342')}
                                    body={this.state.modal_body_send_result}/>

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
                        </>}
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
    }))(withRouter(TransactionBurnView));
