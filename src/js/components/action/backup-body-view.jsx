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
            mnemonic            : [],
            show_mnemonic_phrase: false
        };
    }

    showMnemonicPhrase() {
        API.getMnemonicPhrase().then(phrase => {
            this.setState({
                mnemonic            : phrase.mnemonic_phrase.split(' '),
                show_mnemonic_phrase: true
            });
        });
    }

    render() {
        return <>
            <div className={'form-group'}>
                {Translation.getPhrase('HAuW8C8V2')}
            </div>

            {this.state.show_mnemonic_phrase && (
                <div className={'mnemonic'}>
                    <Form.Group>
                        <label>{Translation.getPhrase('01f11055b')}</label>
                        {/* second div wrapper prevents select of label on tripple click */}
                        <div>
                            <div className={'form-control'}>
                                {this.state.mnemonic.join(' ')}
                            </div>
                        </div>
                    </Form.Group>
                </div>
            )}

            {!this.state.show_mnemonic_phrase && (
                <div className={'text-center'}>
                    <Button variant="outline-primary"
                            className={'btn btn-w-md btn-accent'}
                            onClick={() => {
                                this.showMnemonicPhrase(true);
                            }}>{Translation.getPhrase('038474cb2')}
                    </Button>
                </div>
            )}
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(BackupBodyView));
