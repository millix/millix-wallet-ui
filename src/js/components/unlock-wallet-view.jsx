import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import {Button, Col, Container, FormControl, Row, Tabs, Tab, Nav} from 'react-bootstrap';
import store from '../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import {unlockWallet, walletReady, walletUpdateAddresses, walletUpdateBalance} from '../redux/actions';

const styles           = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};
const UnlockWalletView = (props) => {
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

    return (
        <Container style={{
            marginTop  : 50,
            paddingLeft: 25
        }}>
            <div className="container-center lg" style={{marginTop: '5%'}}>
                <div className="cols-xs-12 col-lg-12">
                    <div className="panel-body view-header">
                        <Tab.Container defaultActiveKey={1}>
                            <Row>
                                <Col xs={12}>
                                    <Nav variant="tabs" className="col-lg-12">
                                        <Nav.Item className="col-lg-4">
                                            <Nav.Link className="col-lg-12"
                                                      eventKey={1}>
                                                <div
                                                    className="page_subtitle labeled row">
                                                    <div
                                                        className="header-icon col-lg-2">
                                                        <FontAwesomeIcon
                                                            icon="sign-in-alt"
                                                            size="3x"/>
                                                    </div>
                                                    <h3 className="col-lg-7">login</h3>
                                                </div>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item className="col-lg-4">
                                            <Nav.Link className="col-lg-12"
                                                      eventKey={2}>
                                                <div
                                                    className="page_subtitle labeled row">
                                                    <div
                                                        className="header-icon col-lg-2">
                                                        <FontAwesomeIcon
                                                            icon="plus"
                                                            size="3x"/>
                                                    </div>
                                                    <h3 className="col-lg-7">generate
                                                        wallet</h3>
                                                </div>
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item className="col-lg-4">
                                            <Nav.Link className="col-lg-12"
                                                      eventKey={3}>
                                                <div
                                                    className="page_subtitle labeled row">
                                                    <div
                                                        className="header-icon col-lg-2">
                                                        <FontAwesomeIcon
                                                            icon="file-import"
                                                            size="3x"/>
                                                    </div>
                                                    <h3 className="col-lg-7">import
                                                        wallet</h3>
                                                </div>
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
                                                                className="d-grid gap-2">
                                                                <Button
                                                                    variant="primary"
                                                                    size="lg"
                                                                    className={'btn btn-primary form-control btn-w-md col-lg-12  col-xs-12'}
                                                                    onClick={() => walletUnlockWithPassword(passphraseRef.value)}> login </Button>
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
                                                        className="alert alert-danger"
                                                        role="alert">
                                                        this process will
                                                        replace your current
                                                        private_key at the
                                                        following
                                                        location <span>{store.getState().config['NODE_KEY_PATH']}</span>
                                                    </div>
                                                    <div className="pb-3">
                                                        <div
                                                            className="d-grid gap-2">
                                                            <Button
                                                                variant="primary"
                                                                size="lg"
                                                                className={'btn btn-primary form-control btn-w-md col-lg-12  col-xs-12'}
                                                                onClick={() => props.history.push('/new-wallet/')}> generate </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={3}>
                                            <div className="panel panel-filled">
                                                <div className="panel-body">
                                                    <div
                                                        className="alert alert-danger"
                                                        role="alert">
                                                        this process will
                                                        replace your current
                                                        private_key at the
                                                        following
                                                        location <span>{store.getState().config['NODE_KEY_PATH']}</span>
                                                    </div>
                                                    <div className="pb-3">
                                                        <div
                                                            className="d-grid gap-2">
                                                            <Button
                                                                variant="primary"
                                                                size="lg"
                                                                className={'btn btn-primary form-control btn-w-md col-lg-12  col-xs-12'}
                                                                onClick={() => props.history.push('/import-wallet/')}> import </Button>
                                                        </div>
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
