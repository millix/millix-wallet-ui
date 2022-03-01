import React, {Component} from 'react';
import {Button, Col, Row} from 'react-bootstrap';
import fs from 'fs';
import API from '../api';
import ModalView from './utils/modal-view';
import * as text from '../helper/text';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

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
        let now    = Date.now();
        this.state = {
            fileKeyExport: 'export_' + now,
            fileKeyImport: 'import_' + now,
            modalShow    : false
        };
    }

    componentDidMount() {
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
                            <div className={'panel-heading bordered'}>reset
                                validation
                            </div>
                            <div className={'panel-body'}>
                                <div>
                                    reset validation forces your node to
                                    revalidate all your transactions (to or from
                                    you)
                                </div>
                                <div>
                                    it is recommended to do in one of the
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


export default ActionView;
