import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import {Button, Form} from 'react-bootstrap';
import API from '../../api';
import WalletCreatePasswordView from './wallet-create-password-view';
import {unlockWallet} from '../../redux/actions';
import Translation from '../../common/translation';


class ImportWalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mnemonic         : undefined,
            mnemonic_is_valid: false,
            password_new     : undefined,
            password_confirm : undefined,
            password_valid   : false,
            wallet_info      : undefined
        };

        this.validateMnemonicPhrase = this.validateMnemonicPhrase.bind(this);
    }

    verifyPassword() {
        let validPassword = this.state.password_new && this.state.password_new.length > 0;
        this.setState({password_valid: validPassword && this.state.password_new === this.state.password_confirm});
    }

    onPassword(password) {
        this.setState({password_new: password}, () => this.verifyPassword());
    }

    onConfirmPassword(passwordConfirm) {
        this.setState({password_confirm: passwordConfirm}, () => this.verifyPassword());
    }

    validateMnemonicPhrase(event) {
        let result_new_mnemonic = event.target.value.split(' ');
        result_new_mnemonic     = result_new_mnemonic.filter(word => word.trim().length > 0);
        const is_valid          = result_new_mnemonic.length === 24;

        this.setState({
            mnemonic_is_valid: is_valid,
            mnemonic         : result_new_mnemonic
        });
    }

    createNewWallet() {
        API.newSessionWithPhrase(this.state.password_confirm, this.state.mnemonic.join(' '))
           .then(data => {
               this.setState({
                   wallet_info: data.wallet
               }, () => {
                   this.props.unlockWallet(this.state.wallet_info);
                   this.props.history.push('/');
               });
           });
    }

    render() {
        if (this.props.wallet.unlocked) {
            return <Redirect to={{pathname: '/'}}/>;
        }

        const next_button_disabled = !this.state.mnemonic_is_valid || !this.state.password_valid;

        return <>
            <div className={'mnemonic'}>
                <Form.Group className="form-group">
                    <label>{Translation.getPhrase('afa9ebab3')}</label>
                    <Form.Control type="text"
                                  placeholder={Translation.getPhrase('080d63a14')}
                                  onChange={this.validateMnemonicPhrase}/>
                </Form.Group>
            </div>
            <WalletCreatePasswordView
                processName={'create'}
                notConfirmed={!this.state.password_valid}
                onPassword={this.onPassword.bind(this)}
                onConfirmPassword={this.onConfirmPassword.bind(this)}/>
            <div className={'d-flex justify-content-center'}>
                <Button variant="outline-primary"
                        disabled={next_button_disabled}
                        onClick={() => this.createNewWallet()}>{Translation.getPhrase('92a871b62')}</Button>
            </div>
        </>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {unlockWallet}
)(withRouter(ImportWalletView));
