import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, FormControl, Nav, Row, Tab} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../../api';
import {unlockWallet, walletReady} from '../../redux/actions';
import ErrorList from '../utils/error-list-view';
import Translation from '../../common/translation';
import NewWalletView from './new-wallet-view';
import ImportWalletView from './import-wallet-view';
import WarningList from '../utils/warning-list-view';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};


class UnlockWalletView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error_list        : [],
            warning_list      : [],
            private_key_exists: undefined, //ternary status: false -- doesn't
            // exists, true -- exist, undefined --
            // unknown. ajax didn't return a response yet
            defaultTabActiveKey: 1
        };
    }

    componentDidMount() {
        this.isPrivateKeyExist();
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
                let warning_list = [];
                warning_list.push({
                    name   : 'auth_error',
                    message: Translation.getPhrase('a51c94711')
                });
                this.setState({
                    private_key_exists : false,
                    defaultTabActiveKey: 2,
                    warning_list       : warning_list,
                    error_list         : []
                });
            }
        }).catch(_ => {
            setTimeout(() => {
                this.isPrivateKeyExist();
            }, 500);
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
            props.history.replace(this.props.location.state.from ?? '/');
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
                    message: Translation.getPhrase('1704c9739')
                });

                this.setState({
                    error_list  : error_list,
                    warning_list: []
                });
            });
        };

        let create_wallet_warning = <>
            <div className={'form-group'}>
                <div className="section_subtitle">
                    {Translation.getPhrase('a1f1962b0')}
                </div>
                <div>{Translation.getPhrase('nZNDLcY3N')}</div>
            </div>
        </>;

        let import_wallet_warning = <>
            <div className={'form-group'}>
                <div className="section_subtitle">
                    {Translation.getPhrase('a1f1962b0')}
                </div>
                <div>{Translation.getPhrase('kRl4q57S4')}</div>
            </div>
        </>;


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
                                                        {Translation.getPhrase('2f90ead35')}
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
                                                        {Translation.getPhrase('8e3d5819b')}
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
                                                        {Translation.getPhrase('dd46d77cc')}
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
                                                            <WarningList
                                                                warning_list={this.state.warning_list}/>
                                                            <ErrorList
                                                                error_list={this.state.error_list}/>
                                                            {this.state.private_key_exists === undefined ? (
                                                                <div className="col-lg-12 text-center mt-4 mb-4">
                                                                    {Translation.getPhrase('a83fc8633')}
                                                                </div>
                                                            ) : ('')}
                                                            {
                                                                this.state.private_key_exists === true ? (
                                                                    <div>
                                                                        <div
                                                                            className="form-group">
                                                                            <label
                                                                                className="control-label">{Translation.getPhrase('95c8aab11')}</label>
                                                                            <FormControl
                                                                                ref={c => {
                                                                                    passphraseRef = c;
                                                                                    passphraseRef && passphraseRef.focus();
                                                                                }}
                                                                                type="password"
                                                                                placeholder="******"
                                                                                aria-label={Translation.getPhrase('a71060280')}
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
                                                                            onClick={() => walletUnlockWithPassword(passphraseRef.value)}>
                                                                            {Translation.getPhrase('936255419')}
                                                                        </Button>
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
                                                        {this.state.private_key_exists === true && create_wallet_warning}
                                                        <div className={'mb-3'}>{Translation.getPhrase('Vh5bMwzK8')}</div>
                                                        <NewWalletView/>
                                                    </div>
                                                </div>
                                            </Tab.Pane>
                                            <Tab.Pane eventKey={3}>
                                                <div
                                                    className="panel panel-filled">
                                                    <div className="panel-body">
                                                        {this.state.private_key_exists === true && import_wallet_warning}
                                                        <ImportWalletView/>
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
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        unlockWallet,
        walletReady
    }
)(UnlockWalletView);
