import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import API from '../../api';
import MnemonicView from '../utils/mnemonic-view';


class MnemonicPhraseView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalShowMnemonic: false,
            mnemonic         : []
        };
    }

    exportPrivateKey() {
        API.getMnemonicPhrase().then(phrase => {
            let json              = JSON.stringify(phrase);
            const blob            = new Blob([json]);
            const fileDownloadUrl = URL.createObjectURL(blob);

            this.setState({
                    fileDownloadUrl: fileDownloadUrl
                },
                () => {
                    this.dofileDownload.click();
                    URL.revokeObjectURL(fileDownloadUrl);
                    this.setState({fileDownloadUrl: ''});
                });
        });
    }

    showMnemonicPhraseModal() {
        API.getMnemonicPhrase().then(phrase => {
            this.setState({
                mnemonic: phrase.mnemonic_phrase.split(' ')
            });
            this.changeModalShowMnemonic(true);
        });
    }

    changeModalShowMnemonic(value = true) {
        this.setState({
            modalShowMnemonic: value
        });
    }

    render() {
        return <>
            <ModalView show={this.state.modalShowMnemonic}
                       size={'xl'}
                       heading={'mnemonic phrase'}
                       on_close={() => this.changeModalShowMnemonic(false)}
                       body={
                           <MnemonicView mnemonic={this.state.mnemonic}/>
                       }/>

            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>backup</div>
                <div className={'panel-body'}>
                    <p>mnemonic phrase is a unique string that allows you to access your wallet. if you loose your mnemonic phrase you
                        will not be able to access this wallet or any funds it contains. we recommend you to write these words down and
                        keep them in a safe place. avoid saving your mnemonic phrase in a computer or online service and do not take a
                        screenshot of it. millix_private_key.json contains your wallet mnemonic phrase.</p>
                    <div className={'text-center form-group'}>
                        <Button variant="outline-primary"
                                className={'btn btn-w-md btn-accent'}
                                onClick={() => {
                                    this.exportPrivateKey();
                                }}>
                            save millix_private_key.json
                        </Button>
                        <a style={{display: 'none'}}
                           download="millix_private_key.json"
                           href={this.state.fileDownloadUrl}
                           ref={e => this.dofileDownload = e}
                        />
                    </div>
                    <div className={'text-center'}>
                        <Button variant="outline-primary"
                                className={'btn btn-w-md btn-accent'}
                                onClick={() => {
                                    this.showMnemonicPhraseModal();
                                }}>show mnemonic phrase
                        </Button>
                    </div>
                </div>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(MnemonicPhraseView));
