import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import API from '../../api';
import WalletCreatePasswordView from './wallet-create-password-view';
import {unlockWallet} from '../../redux/actions';
import Translation from '../../common/translation';


class NewWalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password_new    : undefined,
            password_confirm: undefined,
            password_valid  : false,
            wallet_info     : undefined
        };
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

    createNewWallet() {
        API.getRandomMnemonic()
           .then(data => {
               API.newSessionWithPhrase(this.state.password_confirm, data.mnemonic)
                  .then(data => {
                      let wallet_info              = data.wallet;
                      const address_key_identifier = wallet_info.address_key_identifier;

                      let backup_reminder = localStorage.getItem('backup_reminder');
                      if (!backup_reminder) {
                          backup_reminder = {};
                      }
                      else {
                          backup_reminder = JSON.parse(backup_reminder);
                      }

                      backup_reminder[address_key_identifier] = {
                          display_counter: 0,
                          timestamp      : 0
                      };
                      localStorage.setItem('backup_reminder', JSON.stringify(backup_reminder));


                      this.setState({
                          wallet_info
                      });
                  })
                  .then(() => {
                      this.props.unlockWallet(this.state.wallet_info);
                  });
           });
    }

    render() {
        if (this.props.wallet.unlocked) {
            return <Redirect to={{pathname: '/'}}/>;
        }

        const next_button_disabled = !this.state.password_valid;

        return (
            <>
                <WalletCreatePasswordView
                    processName={'create'}
                    notConfirmed={!this.state.password_valid}
                    onPassword={this.onPassword.bind(this)}
                    onConfirmPassword={this.onConfirmPassword.bind(this)}/>
                <div
                    className={'d-flex justify-content-center'}>
                    <Button variant="outline-primary"
                            disabled={next_button_disabled}
                            onClick={() => this.createNewWallet()}>{Translation.getPhrase('e4c4d7e06')}</Button>
                </div>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {unlockWallet}
)(NewWalletView);
