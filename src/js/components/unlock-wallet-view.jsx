import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, FormControl, Nav, Row, Tab} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import {unlockWallet, walletReady} from '../redux/actions';
import ErrorList from './utils/error-list-view';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};


class UnlockWalletView extends Component {
    constructor(props) {
        super(props);
        this.private_key_exists_interval_id = undefined;
        this.state                         = {
            error_list       : [],
            private_key_exists: undefined, //ternary status: false -- doesn't
            // exists, true -- exist, undefined --
            // unknown. ajax didn't return a response yet
            defaultTabActiveKey: 1
        };
    }

    componentDidMount() {
        this.private_key_exists_interval_id = setInterval(() => {
            this.isPrivateKeyExist();
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.private_key_exists_interval_id);
    }

    activateTab(eventKey) {
        this.setState(
            {
                defaultTabActiveKey: eventKey
            }
        );
    }

    isPrivateKeyExist() {
        API.getIsPrivateKeyExist().then(response => {       
            if (typeof (response.private_key_exists) === 'boolean') {
                if (response.private_key_exists) {
                    this.setState({
                        private_key_exists: true
                    });
                }
            }
            else {
                let error_list = [];
                error_list.push({
                    name   : 'auth_error',
                    message: 'millix_private_key.json not found'
                });
                this.setState({
                    private_key_exists  : false,
                    defaultTabActiveKey: 2,
                    error_list         : error_list
                });
            }
            clearInterval(this.private_key_exists_interval_id);
        });
    }


    render() {
        let props = this.props;
        if (props.wallet.unlocked) {
            const {from} = props.location.state || {from: {pathname: '/'}};
            return <Redirect to={from}/>;
        }
        else if (props.wallet.isNew) {
            return <Redirect to={{pathname: '/new-wallet/'}}/>;
        }

        const goToWalletView = (walletInfo) => {
            props.unlockWallet(walletInfo);
            props.history.replace('/');
        };

        let passphraseRef;

        const walletUnlockWithPassword = (password) => {
            const error_list = [];
            API.newSession(password)
               .then(data => {
                   if (data.api_status !== 'success') {
                       return;
                   }

                   goToWalletView(data.wallet);
               }).catch(_ => {
                props.walletReady({authenticationError: true});

                error_list.push({
                    name   : 'auth_error_name',
                    message: 'there was a problem authenticating your key file. please make sure you are using correct password'
                });

                this.setState({
                    error_list: error_list
                });
            });
        };

        return (
            <Container>
                <div className="unlock-container">
                    <div className="cols-xs-12">
                        <div className="panel-body view-header tab">
                            <Tab.Container
                                activeKey={this.state.defaultTabActiveKey}
                            >
                                <Row>
                                    <Col xs={12}>
                                        <Nav variant="tabs"
                                             className="col-lg-12">
                                            <Nav.Item
                                                className="col-lg-4"
                                                onClick={() => this.activateTab(1)}
                                            >
                                                <Nav.Link className="col-lg-12"
                                                          eventKey={1}>
                                                    <h5 className="page_subtitle labeled">
                                                        <FontAwesomeIcon
                                                            className="fal"
                                                            icon="sign-in-alt"/>
                                                        login
                                                    </h5>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item
                                                className="col-lg-4"
                                                onClick={() => this.activateTab(2)}
                                            >
                                                <Nav.Link className="col-lg-12"
                                                          eventKey={2}>
                                                    <h5 className="page_subtitle labeled">
                                                        <FontAwesomeIcon
                                                            className="fal"
                                                            icon="plus"/>
                                                        create
                                                    </h5>
                                                </Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item
                                                className="col-lg-4"
                                                onClick={() => this.activateTab(3)}
                                            >
                                                <Nav.Link className="col-lg-12"
                                                          eventKey={3}>
                                                    <h5 className="page_subtitle labeled">
                                                        <FontAwesomeIcon
                                                            className="fal"
                                                            icon="file-import"/>
                                                        import
                                                    </h5>
                                                </Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </Col>
                                    <Col xs={12}>
                                        <Tab.Content>
                                            <Tab.Pane eventKey={1}>
                                                <div id="login"
                                                     className="tab-pane">
                                                    <div
                                                        className="panel panel-filled">
                                                        <div
                                                            className="panel-body">
                                                            <ErrorList
                                                                error_list={this.state.error_list}/>
                                                            {this.state.private_key_exists === undefined ? (
                                                                <div
                                                                    className="col-lg-12 text-center mt-4 mb-4">
                                                                    looking
                                                                    for
                                                                    private
                                                                    key
                                                                </div>
                                                            ) : ('')}
                                                            {
                                                                this.state.private_key_exists === true ? (
                                                                    <div>
                                                                        <div
                                                                            className="form-group">
                                                                            <label
                                                                                className="control-label"
                                                                                htmlFor="password">password</label>
                                                                            <FormControl
                                                                                ref={c => {
                                                                                    passphraseRef = c;
                                                                                    passphraseRef && passphraseRef.focus();
                                                                                }}
                                                                                type="password"
                                                                                placeholder="******"
                                                                                aria-label="wallet password"
                                                                                aria-describedby="basic-addon"
                                                                                onKeyPress={(e) => {
                                                                                    if (e.charCode === 13) {
                                                                                        walletUnlockWithPassword(passphraseRef.value);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            variant="outline-primary"
                                                                            className={'w-100'}
                                                                            onClick={() => walletUnlockWithPassword(passphraseRef.value)}>continue</Button>
                                                                    </div>
                                                                ) : ('')
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey={2}>
                                                <div
                                                    className="panel panel-filled">
                                                    <div className="panel-body">
                                                        <div
                                                            className={'form-group'}>
                                                            <div
                                                                className="section_subtitle">attention
                                                            </div>
                                                            <div>
                                                                this will
                                                                replace existing
                                                                millix_private_key.json
                                                                which contains
                                                                your wallet
                                                                mnemonic phrase.
                                                                you cannot
                                                                reverse
                                                                this action.
                                                                you will not be
                                                                able
                                                                to access this
                                                                wallet or any
                                                                funds
                                                                it contains.
                                                            </div>
                                                            <div>
                                                                please make sure
                                                                you
                                                                saved a copy of
                                                                millix_private_key.json
                                                                to a
                                                                safe
                                                                place before
                                                                proceed
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className={'w-100'}
                                                            variant="outline-primary"
                                                            onClick={() => props.history.push('/new-wallet/')}>continue</Button>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey={3}>
                                                <div
                                                    className="panel panel-filled">
                                                    <div className="panel-body">
                                                        <div
                                                            className={'form-group'}>
                                                            <div
                                                                className="section_subtitle">attention
                                                            </div>
                                                            <div>
                                                                this will
                                                                replace existing
                                                                millix_private_key.json
                                                                which contains
                                                                your wallet
                                                                mnemonic phrase.
                                                                you cannot
                                                                reverse
                                                                this action.
                                                                you will not be
                                                                able
                                                                to access this
                                                                wallet or any
                                                                funds
                                                                it contains.
                                                            </div>
                                                            <div>
                                                                please make sure
                                                                you
                                                                saved a copy of
                                                                millix_private_key.json
                                                                to a
                                                                safe
                                                                place before
                                                                proceed
                                                            </div>
                                                        </div>
                                                        <Button
                                                            className={'w-100'}
                                                            variant="outline-primary"
                                                            onClick={() => props.history.push('/import-wallet/')}>continue</Button>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                        </Tab.Content>
                                    </Col>
                                </Row>
                            </Tab.Container>
                        </div>
                    </div>
                </div>
                {props.wallet.notification_message && (props.wallet.notification_message.is_sticky || props.wallet.notification_message.timestamp + 10000 >= Date.now()) &&
                 props.wallet.notification_message.message.split('\n').map((message, idx) =>
                     <Row key={'message_' + idx}>
                         <Col style={{
                             ...styles.centered,
                             marginTop: idx === 0 ? 30 : 0
                         }}>
                             <small>
                                 {message}
                             </small>
                         </Col>
                     </Row>)}
            </Container>
        );
    };
};

export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        unlockWallet,
        walletReady
    }
)(UnlockWalletView);
