import React, {Component} from 'react';
import {Button, Col, Dropdown, Form, Row} from 'react-bootstrap';
import fs from 'fs';
import API from '../api';
import ModalView from './utils/modal-view';
import * as text from '../helper/text';
import {millix, number} from '../helper/format';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import VolumeControl from './utils/volume-control-view';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {updateNotificationVolume} from '../redux/actions';
import ErrorList from './utils/error-list-view';
import DropdownToggle from 'react-bootstrap/DropdownToggle';
import DropdownMenu from 'react-bootstrap/DropdownMenu';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    },
    left    : {
        display       : 'flex',
        justifyContent: 'left'
    }
};


class ActionView extends Component {
    constructor(props) {
        super(props);
        let now                              = Date.now();
        this.state                           = {
            fileKeyExport                       : 'export_' + now,
            fileKeyImport                       : 'import_' + now,
            modalShow                           : false,
            sending                             : false,
            canceling                           : false,
            disableAggregateButton              : true,
            sendAggregateTransactionError       : false,
            sendAggregateTransactionErrorMessage: null,
            errorList                           : [],
            transactionOutputCount              : undefined,
            transactionMaxAmount                : undefined,
            transactionOutputToAggregate        : 0,
            modalAggregateShow                  : false,
            modalAggregateShowSendResult        : false,
            modalAggregateBodySendResult        : [],
            modeNodeSyncFull                    : false
        };
        this.minTransactionOutputToAggregate = 2;
        this.maxTransactionOutputToAggregate = 120;
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.initialVolume === undefined) {
            this.setState({initialVolume: nextProps.notification.volume});
        }
    }

    componentDidMount() {
        this.updateAggregationStats();
        this.getFullNodeMode();
    }

    getFullNodeMode() {
        API.getNodeConfigValueByName('MODE_NODE_SYNC_FULL')
           .then(data => {
               this.setState({modeNodeSyncFull: data.value === 'true'});
           });
    }

    setIsFullNode(isFullNode) {
        this.setState({modeNodeSyncFull: isFullNode});
        API.updateNodeConfigValue('MODE_NODE_SYNC_FULL', isFullNode.toString())
           .then(_ => _);
    }

    updateAggregationStats() {
        API.getUnspentOutputStat()
           .then(data => {
               if (data.api_status === 'fail') {
                   return Promise.reject(data);
               }

               let transactionOutputToAggregate = Math.min(data.transaction_output_count, this.maxTransactionOutputToAggregate);

               this.setState({
                   transactionOutputCount: data.transaction_output_count,
                   transactionMaxAmount  : data.transaction_max_amount,
                   disableAggregateButton: data.transaction_output_count < this.minTransactionOutputToAggregate,
                   transactionOutputToAggregate
               });
           })
           .catch(() => {
               this.setState({
                   errorList: [
                       {
                           name   : 'sendTransactionError',
                           message: 'cannot get information about the unspent deposits from the api'
                       }
                   ]
               });
           });
    }

    exportKeys() {
        if (this.inputExport.value === '') {
            this.setState({exportingWallet: false});
            return;
        }

        console.log('saving keys to ', this.inputExport.value);

        /*walletUtils.loadMnemonic()
         .then(([mnemonicPhrase, _]) => {
         wallet.getWalletAddresses()
         .then(addresses => {
         let json = JSON.stringify({
         mnemonic_phrase: mnemonicPhrase,
         addresses
         });
         fs.writeFile(this.inputExport.value, json, 'utf8', () => {
         this.setState({
         fileKeyExport  : 'export_' + Date.now(),
         exportingWallet: false
         });
         });
         });
         });*/
    }

    importKey() {
        let self = this;
        if (this.inputImport.value === '') {
            this.setState({importingWallet: false});
            return;
        }

        console.log('importing keys from ', this.inputImport.value);

        fs.readFile(this.inputImport.value, 'utf8', function(err, dataString) {
            if (err) {
                this.setState({importingWallet: false});
                return;
            }

            const data = JSON.parse(dataString);
            if (data.mnemonic_phrase) {
                /*walletUtils.storeMnemonic(data.mnemonic_phrase, true)
                 .then(() =>
                 new Promise(resolve => {
                 async.each(data.addresses, (entry, callback) => {
                 database.getRepository('keychain')
                 .addAddress(entry.wallet_id, entry.is_change, entry.address_position, entry.address_base, entry.address_version, entry.address_key_identifier, entry.address_attribute)
                 .then(() => callback()).catch((e) => {
                 console.log(e);
                 callback();
                 });
                 }, () => resolve());
                 })
                 )
                 .then(() => {
                 self.setState({importingWallet: false});
                 eventBus.emit('wallet_lock', {isImportWallet: true});
                 });*/
            }
            else {
                self.setState({importingWallet: false});
            }
        });
        this.setState({fileKeyImport: 'import_' + Date.now()});
    }

    optimizeWallet() {
        /*wallet.stop();
         network.stop();
         peer.stop();
         logManager.stop();
         store.dispatch(updateWalletMaintenance(true));
         database.runVacuum()
         .then(() => database.runWallCheckpoint())
         .then(() => {
         store.dispatch(updateWalletMaintenance(false));
         wallet.initialize(true)
         .then(() => logManager.initialize())
         .then(() => network.initialize())
         .then(() => peer.initialize());
         });*/
    }

    aggregateUnspentOutputs() {
        this.setState({sending: true});

        API.sendAggregationTransaction()
           .then(data => {
               if (data.api_status === 'fail') {
                   this.changeAggregateModalShow(false);
                   return Promise.reject(data);
               }
               return data;
           })
           .then(data => {
               const transaction = data.transaction.find(item => {
                   return item.version.indexOf('0a') !== -1;
               });

               const modalAggregateBodySendResult = <div>
                   <div>
                       transaction id
                   </div>
                   <div>
                       {transaction.transaction_id}
                   </div>
               </div>;

               this.setState({
                   sending                     : false,
                   feeInputLocked              : true,
                   transactionOutputCount      : undefined,
                   transactionMaxAmount        : undefined,
                   disableAggregateButton      : true,
                   transactionOutputToAggregate: 0,
                   modalAggregateBodySendResult
               }, () => setTimeout(() => this.updateAggregationStats(), 5000));
               this.changeAggregateModalShow(false);
               this.changeAggregateModalShowSendResult();
           }).catch((e) => {
            let sendTransactionErrorMessage;
            let errorList = [];

            if (e !== 'validation_error') {
                if (e && e.api_message) {
                    sendTransactionErrorMessage = text.get_ui_error(e.api_message);
                }
                else {
                    sendTransactionErrorMessage = `your transaction could not be sent: (${e?.api_message?.error.error || e?.api_message?.error || e?.message || e?.api_message || e || 'undefined behaviour'})`;
                }

                errorList.push({
                    name   : 'sendTransactionError',
                    message: sendTransactionErrorMessage
                });
            }
            this.setState({
                errorList,
                sending                     : false,
                canceling                   : false,
                transactionOutputCount      : undefined,
                transactionMaxAmount        : undefined,
                disableAggregateButton      : true,
                transactionOutputToAggregate: 0
            }, () => setTimeout(() => this.updateAggregationStats(), 5000));
            this.changeAggregateModalShow(false);
        });
    }

    doAggregation() {
        let errorList = [];
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
            this.setState({canceling: true});
            return;
        }

        this.setState({
            sendAggregateTransactionError       : false,
            sendAggregateTransactionErrorMessage: null
        });

        this.setState({errorList});

        this.changeAggregateModalShow();
    }

    resetTransactionValidation() {
        API.resetTransactionValidation().then(_ => {
            this.props.history.push('/unspent-transaction-output-list/pending');
        });
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }

    changeAggregateModalShow(value = true) {
        this.setState({
            modalAggregateShow: value
        });
    }

    cancelSendAggregateTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeAggregateModalShow(false);
    }

    changeAggregateModalShowSendResult(value = true) {
        this.setState({
            modalAggregateShowSendResult: value
        });
    }

    render() {
        return (
            <div>
                <ModalView show={this.state.modalShow}
                           size={'lg'}
                           heading={'reset validation'}
                           on_close={() => this.changeModalShow(false)}
                           on_accept={() => this.resetTransactionValidation()}
                           body={<div>
                               <div>continuing will force your node to
                                   revalidate all your transactions. this may
                                   take some time depending on how many
                                   transactions you have.
                               </div>
                               {text.get_confirmation_modal_question()}
                           </div>}/>
                <Row>
                    <Col>
                        {/*<div className={'panel panel-filled'}>
                         <div className={'panel-heading bordered'}>optimize</div>
                         <hr className={'hrPanel'}/>
                         <div className={'panel-body'}>
                         <Row className="mb-1">
                         <Col style={styles.left}>
                         <p>the optimize action compacts the
                         local database and optimize the
                         storage.</p>
                         </Col>
                         </Row>
                         <Row className="mb-3">
                         <Col style={styles.centered}>
                         <Button variant="light"
                         className={'btn btn-w-md btn-accent'}
                         onClick={() => {
                         this.optimizeWallet();
                         }} disabled={true}>
                         optimize
                         </Button>
                         </Col>
                         </Row>
                         </div>
                         </div>*/}
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>audio configuration
                            </div>
                            <div className={'panel-body'}>
                                <div style={{marginBottom: 10}}>
                                    adjust the notification volume of new transactions.
                                </div>
                                <Row>
                                    <Col style={styles.centered}>
                                        <VolumeControl initialVolume={this.state.initialVolume}
                                                       onVolumeChange={volume => this.props.updateNotificationVolume(volume)}/>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>balance aggregation
                            </div>
                            <div className={'panel-body'}>
                                <div>
                                    your wallet has {this.state.transactionOutputCount === undefined ? <div style={{display: 'inline-block'}}
                                                                                                            className="loader-spin-xs"/> : number(this.state.transactionOutputCount)} unspent
                                    deposits. millix uses the smallest unspent deposits first, and there is a limit of 128 unspent deposits used to fund a
                                    single payment. based on the value of your unspent deposits you can send a maximum
                                    of {this.state.transactionMaxAmount === undefined ? <div style={{display: 'inline-block'}}
                                                                                             className="loader-spin-xs"/> : millix(this.state.transactionMaxAmount)} in
                                    a single payment. aggregating your balance consumes the small unspent deposits by sending a payment to yourself.
                                </div>
                                <div style={{
                                    marginBottom: 10,
                                    marginTop   : 20
                                }}>
                                    each time you click aggregate you will see these numbers become more optimized. continue to click the aggregate button until
                                    the maximum millix you can send in a single payment meets your needs. your balance and pending balance will change while
                                    aggregation is processing.
                                </div>
                                <Row>
                                    <Col
                                        className={'d-flex justify-content-center'}>
                                        <ModalView
                                            show={this.state.modalAggregateShow}
                                            size={'lg'}
                                            heading={'aggregation confirmation'}
                                            on_accept={() => this.aggregateUnspentOutputs()}
                                            on_close={() => this.cancelSendAggregateTransaction()}
                                            body={<div>
                                                <div>you are about to
                                                    aggregate {this.state.transactionOutputToAggregate} unspent
                                                    deposits.
                                                </div>
                                                {text.get_confirmation_modal_question()}
                                            </div>}/>

                                        <ModalView
                                            show={this.state.modalAggregateShowSendResult}
                                            size={'lg'}
                                            on_close={() => this.changeAggregateModalShowSendResult(false)}
                                            heading={'the transaction has been sent'}
                                            body={this.state.modalAggregateBodySendResult}/>
                                        <Form.Group as={Row}>
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => this.doAggregation()}
                                                disabled={this.state.canceling || this.state.disableAggregateButton}>
                                                {this.state.sending ?
                                                 <>
                                                     <div style={{
                                                         float      : 'left',
                                                         marginRight: 10
                                                     }}
                                                          className="loader-spin"/>
                                                     {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                                 </> : <><FontAwesomeIcon
                                                        icon="code-merge"
                                                        size="1x"/>aggregate</>}
                                            </Button>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {this.state.errorList.length > 0 && <Row className={'mt-3'}>
                                    <Col
                                        className={'d-flex justify-content-center'}>
                                        <ErrorList
                                            error_list={this.state.errorList}/>
                                    </Col>
                                </Row>}
                            </div>
                        </div>

                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>synch switch
                            </div>
                            <div className={'panel-body'}>
                                <Form.Group>
                                    full node
                                    <div
                                        className="btn-group btn-full-width" style={{marginLeft: 10}}>
                                        <Dropdown>
                                            <DropdownToggle id="dropdown=debug"
                                                            className="btn btn-w-sm  btn-accent dropdown-toggle btn-full-width dropdown-luna">
                                                <p style={{
                                                    float       : 'left',
                                                    marginBottom: '0px'
                                                }}>{this.state.modeNodeSyncFull ? 'on' : 'off'}</p>
                                                <p style={{
                                                    float       : 'right',
                                                    marginBottom: '0px'
                                                }}>
                                                    <span className="caret"/></p>
                                            </DropdownToggle>
                                            <DropdownMenu className="col-lg-12">
                                                {Array.from([
                                                    'on',
                                                    'off'
                                                ]).map(type =>
                                                    <Dropdown.Item
                                                        key={type}
                                                        onClick={() => {
                                                            this.setIsFullNode(type === 'on');
                                                        }}
                                                    >{type}</Dropdown.Item>
                                                )}
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </Form.Group>
                                <div style={{
                                    marginBottom: 10,
                                    marginTop   : 20
                                }}>
                                    running a full node is not required to send and receive transactions or receive payments from advertisers. it is recommended
                                    for devices with good bandwidth availability as it strengthens the millix network and increases your ability and efficiency
                                    to earn fees from the millix network.
                                </div>
                            </div>
                        </div>

                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>reset
                                validation
                            </div>
                            <div className={'panel-body'}>
                                <div>
                                    reset validation forces your node to
                                    revalidate all your transactions (to or from
                                    you). it is recommended to do in one of the
                                    following cases:
                                    <ul>
                                        <li>if you have
                                            transaction(s) in pending state for
                                            longer than 10-15 minutes
                                        </li>
                                        <li>
                                            you think that your balance is wrong
                                        </li>
                                    </ul>
                                </div>

                                <Row>
                                    <Col style={styles.centered}>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => this.changeModalShow()}>
                                            <FontAwesomeIcon
                                                icon="rotate-left"
                                                size="1x"/>reset validation
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        {/*<div className={'panel panel-filled'}>
                         <div className={'panel-heading bordered'}>load wallet</div>
                         <hr className={'hrPanel'}/>
                         <div className={'panel-body'}>
                         <Row className="mb-1">
                         <Col style={styles.left}>
                         <p>the load wallet action allows the
                         user to
                         load a previously exported wallet
                         private key in this millix
                         node.</p>
                         </Col>
                         </Row>
                         <Row className="mb-3">
                         <Col style={styles.centered}>
                         <Button variant="light"
                         className={'btn btn-w-md btn-accent'}
                         onClick={() => {
                         this.inputImport.click();
                         this.setState({importingWallet: true});
                         }} disabled={true}>
                         load wallet
                         </Button>
                         </Col>
                         </Row>
                         </div>
                         </div>
                         <div className={'panel panel-filled'}>
                         <div className={'panel-heading bordered'}>save wallet</div>
                         <hr className={'hrPanel'}/>
                         <div className={'panel-body'}>
                         <Row className="mb-1">
                         <Col style={styles.left}>
                         <p>the save wallet action allows the
                         user to
                         export the wallet private key to a
                         file that can be then loaded in a
                         milli
                         node.</p>
                         </Col>
                         </Row>
                         <Row className="mb-3">
                         <Col style={styles.centered}>
                         <Button variant="light"
                         className={'btn btn-w-md btn-accent'}
                         onClick={() => {
                         this.inputExport.click();
                         this.setState({exportingWallet: true});
                         }} disabled={true}>
                         save wallet
                         </Button>
                         </Col>
                         </Row>
                         </div>
                         </div>*/}
                    </Col>
                </Row>
                <div>
                    <input style={{display: 'none'}} type="file" accept=".json"
                           ref={(component) => this.inputImport = component}
                           onChange={this.importKey.bind(this)}
                           key={this.state.fileKeyImport}/>
                    <input style={{display: 'none'}} type="file" accept=".json"
                           nwsaveas="millix_private_key.json"
                           ref={(component) => this.inputExport = component}
                           onChange={this.exportKeys.bind(this)}
                           key={this.state.fileKeyExport}/>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        notification: state.notification
    }),
    {
        updateNotificationVolume
    })(withRouter(ActionView));
