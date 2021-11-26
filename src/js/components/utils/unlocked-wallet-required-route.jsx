import React from 'react';
import {connect} from 'react-redux';
import {Redirect, Route} from 'react-router-dom';
import Sidebar from '../sidebar';
import {Col, Container} from 'react-bootstrap';
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
                        <Col md="12">
                            <Component {...props} />
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
        wallet : state.wallet,
        node   : state.node
    }))(UnlockedWalletRequiredRoute);
