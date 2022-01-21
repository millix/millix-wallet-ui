import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import WalletCreatePasswordView from './utils/wallet-create-password-view';
import MnemonicView from './utils/mnemonic-view';
import MnemonicConfirmView from './utils/mnemonic-confirm-view';
import NewWalletStepProgressView from './utils/new-wallet-step-progress-view';
import WalletCreateInfoView from './utils/wallet-create-info-view';
import {unlockWallet} from '../redux/actions';

const STATUS = {
    NEW_WALLET_PASSWORD        : 1,
    NEW_WALLET_MNEMONIC        : 2,
    NEW_WALLET_CONFIRM_MNEMONIC: 3,
    NEW_WALLET_CREATED         : 4
};


class NewWalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mnemonic             : undefined,
            mnemonic_is_confirmed: false,
            password_new         : undefined,
            password_confirm     : undefined,
            password_valid       : false,
            wallet_info          : undefined,
            status               : STATUS.NEW_WALLET_PASSWORD
        };
    }

    componentDidMount() {
        API.getRandomMnemonic()
           .then(data => {
               this.setState({mnemonic: data.mnemonic.split(' ')});
           });
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
        API.newSessionWithPhrase(this.state.password_confirm, this.state.mnemonic.join(' '))
           .then(data => {
               this.setState({wallet_info: data.wallet});
           });
    }

    getStepName() {
        const result_step = [
            {
                label: 'create password'
            },
            {
                label: 'save mnemonic phrase'
            },
            {
                label: 'confirm mnemonic phrase'
            },
            {
                label: 'finish'
            }
        ];

        return result_step[this.state.status - 1].label;
    }

    createWalletNextStep() {
        switch (this.state.status) {
            case STATUS.NEW_WALLET_PASSWORD:
                this.setState({status: STATUS.NEW_WALLET_MNEMONIC});
                break;
            case STATUS.NEW_WALLET_MNEMONIC:
                this.setState({status: STATUS.NEW_WALLET_CONFIRM_MNEMONIC});
                break;
            case STATUS.NEW_WALLET_CONFIRM_MNEMONIC:
                this.createNewWallet();
                this.setState({status: STATUS.NEW_WALLET_CREATED});
                break;
            case  STATUS.NEW_WALLET_CREATED:
                this.props.unlockWallet(this.state.wallet_info);
                this.props.history.replace('/');
                break;
            default:
        }
    }

    createWalletPrevStep() {
        switch (this.state.status) {
            case STATUS.NEW_WALLET_CONFIRM_MNEMONIC:
                this.setState({status: STATUS.NEW_WALLET_MNEMONIC});
                break;
            case STATUS.NEW_WALLET_MNEMONIC:
                this.setState({
                    status          : STATUS.NEW_WALLET_PASSWORD,
                    password_confirm: false,
                    password_new    : undefined,
                    password_valid  : undefined
                });
                break;
            default:
        }
    }

    render() {
        if (this.props.wallet.unlocked) {
            return <Redirect to={{pathname: '/'}}/>;
        }

        const {status}             = this.state;
        const next_button_disabled = !this.state.password_valid ||
                                     (this.state.status === STATUS.NEW_WALLET_MNEMONIC && !this.state.mnemonic) ||
                                     (this.state.status === STATUS.NEW_WALLET_CONFIRM_MNEMONIC && !this.state.mnemonic_is_confirmed);

        let back_button = <Button variant="outline-primary" onClick={() => {
            this.props.history.replace('/unlock-wallet/');
        }}>
            back
        </Button>;
        if (this.state.status !== STATUS.NEW_WALLET_PASSWORD &&
            this.state.status !== STATUS.NEW_WALLET_CREATED) {
            back_button = <Button
                variant="outline-default"
                onClick={() => this.createWalletPrevStep()}>back</Button>;
        }

        return (
            <Container style={{
                marginTop  : 50,
                paddingLeft: 25
            }}>
                <>
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>
                            create new wallet
                        </div>
                        <div className={'panel-body'}>
                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        step {this.state.status} of {Object.keys(STATUS).length}. {this.getStepName()}
                                    </div>
                                    <div>
                                        {this.state.mnemonic && status === STATUS.NEW_WALLET_MNEMONIC && (
                                            <MnemonicView
                                                mnemonic={this.state.mnemonic}/>)}
                                        {this.state.mnemonic && status === STATUS.NEW_WALLET_CONFIRM_MNEMONIC && (
                                            <MnemonicConfirmView
                                                mnemonic={this.state.mnemonic}
                                                onChange={isConfirmed => this.setState({mnemonic_is_confirmed: isConfirmed})}/>)}
                                        {this.state.status === STATUS.NEW_WALLET_PASSWORD && (
                                            <WalletCreatePasswordView
                                                notConfirmed={!this.state.password_valid}
                                                onPassword={this.onPassword.bind(this)}
                                                onConfirmPassword={this.onConfirmPassword.bind(this)}/>)}
                                        {this.state.wallet_info && this.state.status === STATUS.NEW_WALLET_CREATED && (
                                            <WalletCreateInfoView
                                                wallet={this.state.wallet_info}/>
                                        )}
                                    </div>
                                    <div
                                        className={'d-flex justify-content-center'}>
                                        <div className={'me-2'}>
                                            {back_button}
                                        </div>
                                        <Button variant="outline-primary"
                                                disabled={next_button_disabled}
                                                onClick={() => this.createWalletNextStep()}>continue</Button>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </>
            </Container>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {unlockWallet}
)(NewWalletView);
