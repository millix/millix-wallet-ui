import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Button, Collapse} from 'react-bootstrap';
import {BRIDGE_ETH_CONTRACT_ADDRESS} from '../../../config';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import HelpIconView from '../utils/help-icon-view';
import bridgeWalletScreen from '../../../image/bridge_eth_metamask/wallet.png';
import bridgeWalletImportToken from '../../../image/bridge_eth_metamask/import_token.png';
import bridgeWalletImportTokenConfirmation from '../../../image/bridge_eth_metamask/import_token_confirmation.png';
import bridgeWalletImportTokenResult from '../../../image/bridge_eth_metamask/import_token_result.png';


class GettingStartedView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse_overview          : false,
            collapse_metamask          : false,
            collapse_send_to_exchange  : false,
            collapse_send_from_exchange: true
        };
    }

    toggleCollapseState(collapse_name) {
        let stateNew            = this.state;
        stateNew[collapse_name] = !stateNew[collapse_name];

        this.setState(stateNew);
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    getting started
                </div>
                <div className={'panel-body exchange_getting_started'}>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_overview')}>
                        <span>overview</span> <FontAwesomeIcon className={'icon'}
                                                               icon={this.state.collapse_overview ? 'chevron-up' : 'chevron-down'}
                                                               size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_overview}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                You can convert Millix (<b>mlx</b>) to Wrapped Millix (<b>wmlx</b>). wmlx is stored on the Ethereum network.
                            </div>
                            <div className={'mb-2 text-white'}>
                                1 wmlx = 1,000,000 mlx <HelpIconView help_item_name={'bridge_eth_exchange_rate'}/>
                            </div>
                            <div className={'mb-2'}>
                                <div className={'mb-2'}>
                                    Converting mlx to wmlx
                                    uses a bridge<HelpIconView help_item_name={'bridge_eth'}/> that interacts with the Millix Network and the Ethereum Network.
                                    It requires a transaction fee for the Millix Network and the Ethereum network.
                                </div>
                                <div>
                                    <b>You need to have an Ethereum balance available</b>
                                    <ul>
                                        <li>
                                            if you do not have any Ethereum you will not be able to pay transaction fees on the Ethereum network
                                        </li>
                                        <li>
                                            if you do not have any Ethereum you cannot move wmlx anywhere
                                        </li>
                                        <li>
                                            if you do not have any Ethereum you cannot exchange wmlx to another token on Uniswap
                                        </li>
                                        <li>
                                            if you do not have any Ethereum you can not convert from wmlx to mlx
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                    <hr/>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_metamask')}>
                        <span>configure MetaMask</span> <FontAwesomeIcon className={'icon'}
                                                                         icon={this.state.collapse_metamask ? 'chevron-up' : 'chevron-down'}
                                                                         size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_metamask}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                1. {window.ethereum ?
                                    <span>you already have MetaMask<HelpIconView help_item_name={'bridge_eth_metamask'}/> extension installed</span>
                                                    :
                                    <span className={''}>
                                     click <a href={''}
                                              onClick={() => window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn', '_blank').focus()}>
                                     here
                                 </a> to install MetaMask<HelpIconView help_item_name={'bridge_eth_metamask'}/>
                                 </span>
                            }
                            </div>
                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    2. create a wmlx wallet<HelpIconView help_item_name={'bridge_eth_metamask_wallet'}/> within MetaMask to get started
                                </div>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletScreen} target={'_blank'}><img src={bridgeWalletScreen}/></a>
                                </div>
                            </div>
                            <div className={'mb-2'}>
                                3. click <i>import tokens</i>
                            </div>
                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    4. select <i>custom token</i> tab and provide wmlx smart contract address
                                </div>
                                <input className={'form-control mb-2'} readOnly={true} value={BRIDGE_ETH_CONTRACT_ADDRESS}/>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletImportToken} target={'_blank'}><img src={bridgeWalletImportToken}/></a>
                                </div>
                            </div>


                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    5. confirm that you want to <i>import tokens</i>
                                </div>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletImportTokenConfirmation} target={'_blank'}><img src={bridgeWalletImportTokenConfirmation}/></a>
                                </div>
                            </div>

                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    6. when this is completed successfully you will see something like this:
                                </div>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletImportTokenResult} target={'_blank'}><img src={bridgeWalletImportTokenResult}/></a>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                    <hr/>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_send_to_exchange')}>
                        <span>send to exchange</span> <FontAwesomeIcon className={'icon'}
                                                                       icon={this.state.collapse_send_to_exchange ? 'chevron-up' : 'chevron-down'}
                                                                       size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_send_to_exchange}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                When you convert from Millix (mlx) to Wrapped Millix (wmlx) you need to
                            </div>
                            <div className={'mb-2'}>
                                1. specify the Ethereum address that you are sending the
                                Wrapped Millix to. <b>You need to have an Ethereum balance available</b><HelpIconView
                                help_item_name={'bridge_eth_balance_required'}/>
                            </div>
                            <div className={'mb-2'}>
                                2. indicate how many wmlx you wish to send to the Ethereum address.<HelpIconView help_item_name={'bridge_eth_exchange_rate'}/>
                            </div>
                            <div className={'mb-2'}>
                                3. click <i>send</i>. It will take 10-15 minutes for the wmlx to arrive at the Ethereum address.
                            </div>
                            <div>
                                When you send to an Ethereum address the bridge will pay the Ethereum transaction fee for you. You will pay a bridge fee of
                                1,000,000
                                Millix to reimburse the bridge. In addition, there is a Millix network fee of 1,000 to send your Millix to the bridge.
                            </div>
                        </div>
                    </Collapse>

                    <hr/>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_send_from_exchange')}>
                        <span>send from exchange</span> <FontAwesomeIcon className={'icon'}
                                                                         icon={this.state.collapse_send_from_exchange ? 'chevron-up' : 'chevron-down'}
                                                                         size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_send_from_exchange}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                When you convert from Wrapped Millix (wmlx) to Millix (mlx) you need to
                            </div>
                            <div className={'mb-2'}>
                                1. provide the Millix address you want the Millix to be sent to
                            </div>
                            <div className={'mb-2'}>
                                2. indicate how many wmlx you wish to send to the Millix address.<HelpIconView help_item_name={'bridge_eth_exchange_rate'}/>
                            </div>
                            <div className={'mb-2'}>
                                3. click <i>send</i>
                            </div>
                            <div className={'mb-2'}>
                                <div>
                                    Your transaction requires two transaction fees: a fee for the Ethereum network and a fee for the Millix network. <b>You need
                                    to have an Ethereum balance available</b><HelpIconView help_item_name={'bridge_eth_balance_required'}/>
                                </div>
                                <div>
                                    The fee for the Ethereum network is measured in GWEI (amount is calculated automatically). The transaction fee for the
                                    bridge and the Millix network is 1,000,000 mlx.
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
            </div>);
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(GettingStartedView));
