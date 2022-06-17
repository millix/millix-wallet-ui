import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import API from '../../api';
import MnemonicView from '../utils/mnemonic-view';
import Translation from '../../common/translation';


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
                       heading={Translation.getPhrase('ee9c80bf2')}
                       on_close={() => this.changeModalShowMnemonic(false)}
                       body={
                           <MnemonicView mnemonic={this.state.mnemonic}/>
                       }/>

            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{Translation.getPhrase('d436cb960')}</div>
                <div className={'panel-body'}>
                    <p>{Translation.getPhrase('5e6660d19')}</p>
                    <div className={'text-center form-group'}>
                        <Button variant="outline-primary"
                                className={'btn btn-w-md btn-accent'}
                                onClick={() => {
                                    this.exportPrivateKey();
                                }}>
                            {Translation.getPhrase('ffc200ff0')}
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
                                }}>{Translation.getPhrase('038474cb2')}
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
