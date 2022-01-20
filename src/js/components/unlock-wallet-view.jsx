import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, FormControl, Nav, Row, Tab} from 'react-bootstrap';
import store from '../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import {unlockWallet, walletReady} from '../redux/actions';
import ErrorList from './utils/error-list-view';

const styles           = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};
const UnlockWalletView = (props) => {
    let error_list = [];
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
        API.newSession(password)
           .then(data => {
               if (data.api_status === 'fail') {
                   return;
               }
               goToWalletView(data.wallet);
           }).catch(_ => props.walletReady({authenticationError: true}));
    };

    if (props.wallet.authenticationError) {
        error_list.push({
            name   : 'auth_error_name',
            message: <span>there was a problem authenticating your key file. retry your password or <a
                style={{cursor: 'pointer'}}
                onClick={() => props.history.push('import-wallet')}> click here to load your key.</a></span>
        });
    }

    return (
        <Container>
            <div className="unlock-container">
                <div className="cols-xs-12 col-lg-12 hpanel">
                    <div className="panel-body view-header tab">
                        <ErrorList error_list={error_list}/>
                        <Tab.Container defaultActiveKey={1}>
                            <Row>
                                <Col xs={12}>
                                    <Nav variant="tabs" className="col-lg-12">
                                        <Nav.Item className="col-lg-4">
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
                                        <Nav.Item className="col-lg-4">
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
                                        <Nav.Item className="col-lg-4">
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
                                                    <div className="panel-body">
                                                        <div
                                                            className="form-group">
                                                            <label
                                                                className="control-label"
                                                                htmlFor="password">password</label>
                                                            <FormControl
                                                                ref={c => passphraseRef = c}
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
                                                            {props.wallet.authenticationError ? (
                                                                <span
                                                                    className="help-block small">there was a problem authenticating your key file. retry your password or <a
                                                                    style={{cursor: 'pointer'}}
                                                                    onClick={() => props.history.push('/import-wallet/')}> click here to load your key.</a></span>) : ''}
                                                        </div>
                                                        <div className="pb-3">
                                                            <div
                                                                className="d-grid gap-2 mt-4">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="lg"
                                                                    onClick={() => walletUnlockWithPassword(passphraseRef.value)}>continue</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={2}>
                                            <div className="panel panel-filled">
                                                <div className="panel-body">
                                                    <div
                                                        className={'form-group'}>
                                                        <div
                                                            className="section_subtitle">attention
                                                        </div>
                                                        <div>
                                                            this will
                                                            replace existing
                                                            private_key.
                                                            you cannot reverse
                                                            this action.
                                                            you will not be able
                                                            to access this
                                                            wallet or any funds
                                                            it contains.
                                                        </div>
                                                        <div>
                                                            please make sure you
                                                            saved a copy of
                                                            private_key it to a
                                                            safe
                                                            place before proceed
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={'submit-row'}>
                                                        <Button
                                                            className={'w-100'}
                                                            variant="outline-primary"
                                                            onClick={() => props.history.push('/new-wallet/')}>continue</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={3}>
                                            <div className="panel panel-filled">
                                                <div className="panel-body">
                                                    <div
                                                        className={'form-group'}>
                                                        <div
                                                            className="section_subtitle">attention
                                                        </div>
                                                        <div>
                                                            this will
                                                            replace existing
                                                            private_key.
                                                            you cannot reverse
                                                            this action.
                                                            you will not be able
                                                            to access this
                                                            wallet or any funds
                                                            it contains.
                                                        </div>
                                                        <div>
                                                            please make sure you
                                                            saved a copy of
                                                            private_key it to a
                                                            safe
                                                            place before proceed
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={'form-group'}>
                                                        <Button
                                                            className={'w-100'}
                                                            variant="outline-primary"
                                                            onClick={() => props.history.push('/import-wallet/')}>continue</Button>
                                                    </div>
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

export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        unlockWallet,
        walletReady
    }
)(UnlockWalletView);
