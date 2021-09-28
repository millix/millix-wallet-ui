import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {Link, Redirect, Route} from 'react-router-dom';
import {updateNetworkState} from '../../redux/actions';
import Sidebar from '../sidebar';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import API from '../../api/index';
import '../../../../node_modules/mohithg-switchery/switchery.css';
import $ from 'jquery';

const UnlockedWalletRequiredRoute = ({
                                         component: Component,
                                         ...rest
                                     }) => (<Route {...rest} render={props => (
    rest.wallet.unlocked ? (
        <>
            <nav className={'navbar navbar-default navbar-fixed-top'}>
                <div className={'container-fluid'}>
                    <div className={'navbar-header'}>
                        <div id="mobile-menu">
                            <div className={'left-nav-toggle'}>
                                <a
                                    onClick={() => $('body').toggleClass('nav-toggle')}>
                                    <i className={'stroke-hamburgermenu'}/>
                                </a>
                            </div>
                        </div>
                        <a className={'navbar-brand'}>
                            millix
                            <span>{rest.node.node_version && `v.${rest.node.node_version}`}</span>
                        </a>
                    </div>
                    <div id="navbar" className={'navbar-collapse collapse'}>
                        <div className={'left-nav-toggle'}>
                            <a
                                onClick={() => $('body').toggleClass('nav-toggle')}>
                                <i className={'stroke-hamburgermenu'}/>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            <Sidebar {...rest} {...props}/>
            <section className={'content'}>
                <Container fluid={true}>
                    <div>
                        <Col md="10">
                            <Component {...props} />
                        </Col>
                        <Col md="2">
                            <div className={'panel panel-filled'}>
                                <div className={'panel-heading'}>status
                                </div>
                                <hr className={'hrPanel'}/>
                                <div className={'panel-body'}>
                                    {rest.config.MODE_TEST_NETWORK && (<Row>
                                        <Col className="pr-0"
                                             style={{textAlign: 'left'}}>
                                            <span>millix testnet</span>
                                            <hr/>
                                        </Col>
                                    </Row>)}
                                    {!!rest.wallet.version_available && !(rest.config.NODE_MILLIX_VERSION === rest.wallet.version_available || rest.config.NODE_MILLIX_VERSION !== (rest.wallet.version_available + '-tangled')) &&
                                     (<Row>
                                         <Col className="pr-0"
                                              style={{textAlign: 'right'}}>
                                             <Button variant="link"
                                                     onClick={() => {
                                                     }}
                                                     style={{
                                                         fontSize: '75%',
                                                         padding : 0,
                                                         color   : '#ffadad'
                                                     }}>new version
                                                 available
                                                 v.{rest.wallet.version_available} !</Button>
                                         </Col>
                                     </Row>)}
                                    <Row>
                                        <Col className="pr-0"
                                             style={{textAlign: 'left'}}>
                                            <span>event log size: {rest.log.size.toLocaleString('en-US')}</span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-0"
                                             style={{textAlign: 'left'}}>
                                            <span>backlog size: {rest.backlog.size.toLocaleString('en-US')}</span>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="pr-0"
                                             style={{textAlign: 'left'}}>
                                            <Button variant="link"
                                                    onClick={() => props.history.push('/peers')}
                                                    style={{
                                                        padding    : 0,
                                                        borderWidth: '0rem'
                                                    }}>
                                                connections: {rest.network.connections}</Button>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </div>
                </Container>
            </section>
        </>
    ) : (
        <Redirect to={{
            pathname: '/unlock/',
            state   : {from: props.location}
        }}/>
    )
)}/>);

export default connect(
    state => ({
        clock  : state.clock,
        config : state.config,
        log    : state.log,
        network: state.network,
        wallet : state.wallet,
        backlog: state.backlog,
        node   : state.node
    }), {
        updateNetworkState
    })(UnlockedWalletRequiredRoute);
