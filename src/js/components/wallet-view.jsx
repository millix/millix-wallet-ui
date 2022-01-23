import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row, Form, Table, Button, Badge} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from './utils/datatable-view';
import API from '../api/index';
import _ from 'lodash';
import moment from 'moment';
import ErrorList from './utils/error-list-view';
import HelpIconView from './utils/help-icon-view';


class WalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feesLocked : true,
            addressList: [],
            error_list : []
        };
    }

    componentDidMount() {
        this.updateAddresses();
    }

    componentWillUnmount() {
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    updateAddresses() {
        API.listAddresses(this.props.wallet.address_key_identifier)
           .then(addresses => {
               let result = _.sortBy(_.map(addresses, itemAddress => {
                   return {
                       address         : itemAddress.address,
                       address_position: itemAddress.address_position,
                       address_version : itemAddress.address_version,
                       create_date     : moment.unix(itemAddress.create_date).format('YYYY-MM-DD HH:mm:ss')
                   };
               }), address => -address.address_position);

               this.setState({
                   addressList: result
               });
           });
    }

    getNextAddress() {
        API.getNextAddress()
           .then(() => this.updateAddresses());
    }

    _getAmount(value, allowZero = false) {
        const pValue = parseInt(value.replace(/[,.]/g, ''));
        if ((allowZero ? pValue < 0 : pValue <= 0) || pValue.toLocaleString('en-US') !== value) {
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
                   console.log(amount);
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
                   error_list: [],
                   sending   : true
               });

               return API.sendTransaction({
                   transaction_output_list: [
                       {
                           address_base          : destinationAddress,
                           address_version       : destinationAddressVersion,
                           address_key_identifier: destinationAddressIdentifier,
                           amount
                       }
                   ],
                   transaction_output_fee : {
                       fee_type: 'transaction_fee_default',
                       amount  : fees
                   }
               }).then(data => {
                   if (data.api_status === 'fail') {
                       return Promise.reject(data);
                   }
               });
           })
           .then(() => {
               this.destinationAddress.value = '';
               this.amount.value             = '';
               if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                   this.fees.value = this.props.config.TRANSACTION_FEE_DEFAULT.toLocaleString('en-US');
               }
               this.setState({
                   sending   : false,
                   feesLocked: true
               });
           })
           .catch((e) => {
               let sendTransactionErrorMessage;

               if (e !== 'validation_error') {
                   if (e.api_message) {
                       if (typeof (e.api_message) === 'string') {
                           const match = /unexpected generic api error: \((?<message>.*)\)/.exec(e.api_message);
                           sendTransactionErrorMessage = `your transaction could not be sent: (${match.groups.message})`;
                       }
                       else {
                           if (typeof (e.api_message.error) !== 'undefined') {
                               const error = e.api_message.error;
                               if (error.error === 'transaction_input_max_error') {
                                   sendTransactionErrorMessage = <>your transaction tries to use too many outputs<HelpIconView help_item_name={'transaction_max_input_number'}/>. please try to send smaller amount or aggregate manually by sending smaller amounts to yourself. max amount you can send now is {error.data.amount_max.toLocaleString('en-US')} mlx</>;
                               }
                           }
                       }
                   }
                   else if (e === 'insufficient_balance') {
                       sendTransactionErrorMessage = 'your transaction could not be sent: insufficient millix balance';
                   }
                   else if (e === 'transaction_send_interrupt') {
                       sendTransactionErrorMessage = 'your transaction could not be sent: your transaction was canceled';
                   }
                   else {
                       sendTransactionErrorMessage = `your transaction could not be sent: (${e.message || e.api_message || e})`;
                   }

                   error_list.push({
                       name   : 'sendTransactionError',
                       message: sendTransactionErrorMessage
                   });
               }
               this.setState({
                   error_list: error_list,
                   sending   : false
               });
           });
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
        e.target.value = !isNaN(amount) ? amount.toLocaleString('en-US') : 0;

        e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>balance
                            </div>
                            <div className={'panel-body'}>
                                <div className={'d-flex'}>
                                    <Table striped bordered hover>
                                        <thead>
                                        <tr>
                                            <th width="50%">available</th>
                                            <th width="50%">pending
                                                <HelpIconView
                                                    help_item_name={'pending_balance'}/>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr key="1">
                                            <td>
                                                <div className={'d-flex'}>
                                                <span
                                                    className={'d-flex align-self-center'}>
                                                    {this.props.wallet.balance_stable.toLocaleString('en-US')}
                                                </span>
                                                    <Button
                                                        variant="outline-primary"
                                                        className={'btn-xs icon_only ms-auto'}
                                                        onClick={() => this.props.history.push('/unspent-transaction-output-list/stable')}>
                                                        <FontAwesomeIcon
                                                            icon={'list'}
                                                            size="1x"/>
                                                    </Button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={'d-flex'}>
                                                <span
                                                    className={'d-flex align-self-center'}>
                                                {this.props.wallet.balance_pending.toLocaleString('en-US')}
                                                    </span>
                                                    <Button
                                                        variant="outline-primary"
                                                        className={'btn-xs icon_only ms-auto'}
                                                        onClick={() => this.props.history.push('/unspent-transaction-output-list/pending')}>
                                                        <FontAwesomeIcon
                                                            icon={'list'}
                                                            size="1x"/>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        </div>
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
                                                                          this.fees.value      = this.props.config.TRANSACTION_FEE_DEFAULT.toLocaleString('en-US');
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
                                            <Form.Group as={Row}>
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={this.send.bind(this)}
                                                    disabled={this.state.canceling}>
                                                    {this.state.sending ?
                                                     <>
                                                         <div style={{
                                                             fontSize: '6px',
                                                             float   : 'left'
                                                         }}
                                                              className="loader-spin"/>
                                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                                     </> : <>send millix</>}
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>addresses
                            </div>
                            <div className={'panel-body'}>
                                <div className={'datatable_action_row'}>
                                    <Button variant="outline-primary"
                                            className={'btn-sm create_button'}
                                            onClick={() => this.getNextAddress()}>
                                        <FontAwesomeIcon
                                            icon={'plus-circle'}
                                            size="1x"/>generate address
                                    </Button>
                                </div>
                                <Row>
                                    <DatatableView
                                        value={this.state.addressList}
                                        sortField={'address_position'}
                                        sortOrder={1}
                                        resultColumn={[
                                            {
                                                'field'   : 'address_position',
                                                'header'  : 'position',
                                                'sortable': true
                                            },
                                            {
                                                'field'   : 'address',
                                                'header'  : 'address',
                                                'sortable': true
                                            },
                                            {
                                                'field'   : 'address_version',
                                                'header'  : 'version',
                                                'sortable': true
                                            },
                                            {
                                                'field'   : 'create_date',
                                                'header'  : 'create date',
                                                'sortable': true
                                            }
                                        ]}/>
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
