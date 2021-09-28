import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import WalletCreatePasswordView from './utils/wallet-create-password-view';
import MnemonicView from "./utils/mnemonic-view";
import MnemonicConfirmView from "./utils/mnemonic-confirm-view";
import NewWalletStepProgressView from "./utils/new-wallet-step-progress-view";
import WalletCreateInfoView from './utils/wallet-create-info-view';
import {unlockWallet} from "../redux/actions";

const STATUS = {
    NEW_WALLET_PASSWORD: 1,
    NEW_WALLET_MNEMONIC: 2,
    NEW_WALLET_CONFIRM_MNEMONIC: 3,
    NEW_WALLET_CREATED: 4
};

const styles = {
    centered: {
        display: 'flex',
        justifyContent: 'center'
    }
};

class NewWalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mnemonic: undefined,
            mnemonic_is_confirmed: false,
            password_new: undefined,
            password_confirm: undefined,
            password_valid: false,
            wallet_info: undefined,
            status: STATUS.NEW_WALLET_PASSWORD
        };
        this.progressStepBackwards = null;
        this.progressStepForward = null;
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
        API.newSessionWithPhrase(this.state.password_confirm, this.state.mnemonic.join(" "))
            .then(data => {
                this.setState({wallet_info: data.wallet});
            });
    }

    createWalletNextStep() {
        this.progressStepForward();
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
        this.progressStepBackwards();
        switch (this.state.status) {
            case STATUS.NEW_WALLET_CONFIRM_MNEMONIC:
                this.setState({status: STATUS.NEW_WALLET_MNEMONIC});
                break;
            case STATUS.NEW_WALLET_MNEMONIC:
                this.setState({
                    status: STATUS.NEW_WALLET_PASSWORD, password_confirm: false,
                    password_new: undefined, password_valid: undefined
                });
                break;
            default:
        }
    }

    render() {
        if (this.props.wallet.unlocked) {
            return <Redirect to={{pathname: '/'}}/>;
        }

        const {status} = this.state;
        return (
            <Container style={{
                marginTop: 50,
                paddingLeft: 25
            }}>
                <Row className="mb-3">
                    <Button variant="light"
                            className={'btn btn-w-md btn-accent'} style={{
                        float: 'left',
                        marginLeft: '80px'
                    }} onClick={() => {
                        this.props.history.replace('/unlock-wallet/');
                    }}>
                        <FontAwesomeIcon icon="fingerprint"
                                         size="1x"/> unlock
                    </Button>
                </Row>
                <>
                    <div style={{marginBottom: 40}}>
                        <NewWalletStepProgressView stepBackwards={ref => this.progressStepBackwards = ref}
                                                   stepForward={ref => this.progressStepForward = ref}/>
                    </div>
                    {this.state.mnemonic && status === STATUS.NEW_WALLET_MNEMONIC && (
                        <MnemonicView mnemonic={this.state.mnemonic}/>)}
                    {this.state.mnemonic && status === STATUS.NEW_WALLET_CONFIRM_MNEMONIC && (
                        <MnemonicConfirmView mnemonic={this.state.mnemonic}
                                             onChange={isConfirmed => this.setState({mnemonic_is_confirmed: isConfirmed})}/>)}
                    {this.state.status === STATUS.NEW_WALLET_PASSWORD && (
                        <WalletCreatePasswordView notConfirmed={!this.state.password_valid}
                                                  onPassword={this.onPassword.bind(this)}
                                                  onConfirmPassword={this.onConfirmPassword.bind(this)}/>)}
                    {this.state.wallet_info && this.state.status === STATUS.NEW_WALLET_CREATED && (
                        <WalletCreateInfoView wallet={this.state.wallet_info}/>
                    )}
                    <Row>
                        <Col style={styles.centered}>
                            {this.state.status !== STATUS.NEW_WALLET_PASSWORD &&
                            this.state.status !== STATUS.NEW_WALLET_CREATED && (<div className={'mr-2'}>
                                <Button variant="light"
                                        className={'btn btn-w-md btn-accent'}
                                        onClick={() => this.createWalletPrevStep()}>back</Button>
                            </div>)}
                            <Button variant="light"
                                    disabled={!this.state.password_valid ||
                                    (this.state.status === STATUS.NEW_WALLET_MNEMONIC && !this.state.mnemonic) ||
                                    (this.state.status === STATUS.NEW_WALLET_CONFIRM_MNEMONIC && !this.state.mnemonic_is_confirmed)}
                                    className={'btn btn-w-md btn-accent'}
                                    onClick={() => this.createWalletNextStep()}>{this.state.status === STATUS.NEW_WALLET_PASSWORD ? 'next'
                                : this.state.status === STATUS.NEW_WALLET_MNEMONIC ? 'I have saved it' :
                                    this.state.status === STATUS.NEW_WALLET_CONFIRM_MNEMONIC ? 'create wallet' : 'continue'}</Button>
                        </Col>
                    </Row>
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
