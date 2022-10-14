import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import API from '../../api';
import Translation from '../../common/translation';


class BackupBodyView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalShowMnemonic: false,
            mnemonic         : []
        };
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
                           <div className={'mnemonic'}>
                               <Form.Group>
                                   <label>{Translation.getPhrase('01f11055b')}</label>
                                   <Form.Control type="text"
                                                 placeholder={Translation.getPhrase('b8b4deaaf')}
                                                 value={this.state.mnemonic.join(' ')}
                                                 readOnly={true}/>
                               </Form.Group>
                           </div>
                       }/>
            <div className={'form-group'}>
                {Translation.getPhrase('HAuW8C8V2')}
            </div>
            <div className={'text-center'}>
                <Button variant="outline-primary"
                        className={'btn btn-w-md btn-accent'}
                        onClick={() => {
                            this.showMnemonicPhraseModal();
                        }}>{Translation.getPhrase('038474cb2')}
                </Button>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(BackupBodyView));
