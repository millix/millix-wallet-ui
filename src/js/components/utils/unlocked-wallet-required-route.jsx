import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {Redirect, Route} from 'react-router-dom';
import Sidebar from '../sidebar';
import {Col, Container} from 'react-bootstrap';
import '../../../../node_modules/mohithg-switchery/switchery.css';
import $ from 'jquery';
import API from '../../api';
import {setBackLogSize, setLogSize, updateNetworkState, walletUpdateBalance, updateCurrencyPairSummary} from '../../redux/actions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {CURRENCY_PAIR_SUMMARY_REFRESH_INTERVAL_MS} from '../../../config.js';
import APIExternal from '../../api/external';

const UnlockedWalletRequiredRoute = ({
                                         component: Component,
                                         ...rest
                                     }) => {

    useEffect(() => {
        if (!rest.wallet.unlocked) {
            return;
        }
        let timeoutID;
        const getNodeStat = () => {
            timeoutID = setTimeout(() => {
                API.getNodeStat().then(data => {
                    rest.walletUpdateBalance({
                        balance_stable                   : data.balance.stable,
                        balance_pending                  : data.balance.unstable,
                        transaction_wallet_unstable_count: data.transaction.transaction_wallet_unstable_count || 0,
                        transaction_count                : data.transaction.transaction_count || 0
                    });
                    rest.setBackLogSize(data.log.backlog_count);
                    rest.setLogSize(data.log.log_count);
                    rest.updateNetworkState({
                        ...data.network,
                        connections: data.network.peer_count
                    });
                })
                   .catch(() => {
                       getNodeStat();
                   });
            }, 1000);
        };
        getNodeStat();

        let fetch_currency_pair_summary_timeout_id;
        const setCurrencyPairSummary = () => {
            APIExternal.getCurrencyPairSummaryFiatleak().then(response => {
                rest.updateCurrencyPairSummary({
                    price : response.data.price,
                    ticker: response.ticker,
                    symbol: response.symbol
                });
            });
            if (rest.wallet.unlocked) {
                fetch_currency_pair_summary_timeout_id = setTimeout(() => {
                    setCurrencyPairSummary();
                }, CURRENCY_PAIR_SUMMARY_REFRESH_INTERVAL_MS);
            }
        };
        setCurrencyPairSummary();

        return () => {
            clearTimeout(timeoutID);
            clearTimeout(fetch_currency_pair_summary_timeout_id);
        };
    }, [rest.wallet.unlocked]);
    return (<Route {...rest} render={props => (
        rest.wallet.unlocked ? (
            <>
                <nav
                    className={'navbar navbar-default navbar-fixed-top flex-nowrap'}>
                    <div className={'navbar-header'}>
                        <a className={'navbar-brand'}
                           onClick={() => props.history.push('/')}>
                            millix
                        </a>
                    </div>
                    <div id="navbar"
                         className={'navbar-collapse collapse show'}>
                        <div className={'left-nav-toggle'}
                             onClick={() => $('body').toggleClass('nav-toggle')}>
                            <FontAwesomeIcon
                                icon={'bars'}
                                size="lg"/>
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
};

export default connect(
    state => ({
        clock                : state.clock,
        wallet               : state.wallet,
        node                 : state.node,
        currency_pair_summary: state.currency_pair_summary
    }), {
        walletUpdateBalance,
        updateNetworkState,
        setBackLogSize,
        setLogSize,
        updateCurrencyPairSummary
    })(UnlockedWalletRequiredRoute);
