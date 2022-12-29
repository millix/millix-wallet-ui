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
import Translation from '../../common/translation';


class GettingStartedView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            collapse_overview          : true,
            collapse_metamask          : false,
            collapse_send_to_exchange  : false,
            collapse_send_from_exchange: false
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
                    {Translation.getPhrase('pCHSGHLZ8')}
                </div>
                <div className={'panel-body exchange_getting_started'}>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_overview')}>
                        <span>{Translation.getPhrase('zvSN5VyUW')}</span> <FontAwesomeIcon className={'icon'}
                                                                                           icon={this.state.collapse_overview ? 'chevron-up' : 'chevron-down'}
                                                                                           size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_overview}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                {Translation.getPhrase('2mCq2CTwA', {
                                    ticker_mlx : <b>mlx</b>,
                                    ticker_wmlx: <b>wmlx</b>
                                })}
                            </div>
                            <div className={'mb-2 text-white'}>
                                1 wmlx = 1,000,000 mlx <HelpIconView help_item_name={'bridge_eth_exchange_rate'}/>
                            </div>
                            <div className={'mb-2'}>
                                <div className={'mb-2'}>
                                    {Translation.getPhrase('u8nDoiESA', {
                                        help_icon: <HelpIconView help_item_name={'bridge_eth'}/>
                                    })}
                                </div>
                                <div>
                                    <b>{Translation.getPhrase('y13JskKf0')}</b>
                                    <ul>
                                        <li>
                                            {Translation.getPhrase('fRFqFgeuW')}
                                        </li>
                                        <li>
                                            {Translation.getPhrase('cwESzAha1')}
                                        </li>
                                        <li>
                                            {Translation.getPhrase('Tbi0bj8HQ')}
                                        </li>
                                        <li>
                                            {Translation.getPhrase('uqV4CwoY2')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                    <hr/>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_metamask')}>
                        <span>{Translation.getPhrase('Fzx73dKka')}</span> <FontAwesomeIcon className={'icon'}
                                                                                           icon={this.state.collapse_metamask ? 'chevron-up' : 'chevron-down'}
                                                                                           size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_metamask}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                1. {window.ethereum ?
                                    <span>{Translation.getPhrase('szoMkBdfE', {
                                        help_icon: <HelpIconView help_item_name={'bridge_eth_metamask'}/>
                                    })}</span>
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
                                    2. {Translation.getPhrase('NZnzTP7fN', {
                                    help_icon: <HelpIconView help_item_name={'bridge_eth_metamask_wallet'}/>
                                })}
                                </div>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletScreen} target={'_blank'}><img src={bridgeWalletScreen}/></a>
                                </div>
                            </div>
                            <div className={'mb-2'}>
                                3. {Translation.getPhrase('wSfEDfOcB', {
                                import_tokens_phrase: <i>{Translation.getPhrase('hxqDynNEM')}</i>
                            })}
                            </div>
                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    4.
                                    {Translation.getPhrase('9xl24xpBI', {
                                        custom_token_phrase: <i>{Translation.getPhrase('qvYxi6QQJ')}</i>
                                    })}
                                </div>
                                <input className={'form-control mb-2'} readOnly={true} value={BRIDGE_ETH_CONTRACT_ADDRESS}/>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletImportToken} target={'_blank'}><img src={bridgeWalletImportToken}/></a>
                                </div>
                            </div>


                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    5. {Translation.getPhrase('1un2p04AJ', {
                                    import_tokens_phrase: <i>{Translation.getPhrase('C9mxWRoGM')}</i>
                                })}
                                </div>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletImportTokenConfirmation} target={'_blank'}><img src={bridgeWalletImportTokenConfirmation}/></a>
                                </div>
                            </div>

                            <div className={'mb-2'}>
                                <div className={'mb-1'}>
                                    6. {Translation.getPhrase('sUBgsM31L')}
                                </div>
                                <div className={'text-center'}>
                                    <a href={bridgeWalletImportTokenResult} target={'_blank'}><img src={bridgeWalletImportTokenResult}/></a>
                                </div>
                            </div>
                        </div>
                    </Collapse>
                    <hr/>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_send_to_exchange')}>
                        <span>{Translation.getPhrase('rgLWY0FGn')}</span> <FontAwesomeIcon className={'icon'}
                                                                                           icon={this.state.collapse_send_to_exchange ? 'chevron-up' : 'chevron-down'}
                                                                                           size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_send_to_exchange}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                {Translation.getPhrase('TT8GQZAQ4')}
                            </div>
                            <div className={'mb-2'}>
                                1. {Translation.getPhrase('oGyu7ajqx')} <b>{Translation.getPhrase('y13JskKf0')}</b><HelpIconView
                                help_item_name={'bridge_eth_balance_required'}/>
                            </div>
                            <div className={'mb-2'}>
                                2. {Translation.getPhrase('lur7HV4b5')}<HelpIconView help_item_name={'bridge_eth_exchange_rate'}/>
                            </div>
                            <div className={'mb-2'}>
                                3. {Translation.getPhrase('Aldz0MHoa', {
                                send_phrase: <i>{Translation.getPhrase('QuVec3TGo')}</i>
                            })}. {Translation.getPhrase('k028szJjn')}
                            </div>
                            <div>
                                {Translation.getPhrase('8AqXP89ry')}
                            </div>
                        </div>
                    </Collapse>

                    <hr/>
                    <div className={'section_subtitle collapse_title'} onClick={() => this.toggleCollapseState('collapse_send_from_exchange')}>
                        <span>{Translation.getPhrase('J0rheaCHm')}</span> <FontAwesomeIcon className={'icon'}
                                                                                           icon={this.state.collapse_send_from_exchange ? 'chevron-up' : 'chevron-down'}
                                                                                           size="1x"/>
                    </div>
                    <Collapse in={this.state.collapse_send_from_exchange}>
                        <div className={'mb-3 mt-2'}>
                            <div className={'mb-2'}>
                                {Translation.getPhrase('jvPlZ1i12')}
                            </div>
                            <div className={'mb-2'}>
                                1. {Translation.getPhrase('I2u2DAnZW')}
                            </div>
                            <div className={'mb-2'}>
                                2. {Translation.getPhrase('vzwVaB5ED')}<HelpIconView help_item_name={'bridge_eth_exchange_rate'}/>
                            </div>
                            <div className={'mb-2'}>
                                3. {Translation.getPhrase('Aldz0MHoa', {
                                send_phrase: <i>{Translation.getPhrase('QuVec3TGo')}</i>
                            })}
                            </div>
                            <div className={'mb-2'}>
                                <div>
                                    {Translation.getPhrase('IME4DoFhS')}<b>{Translation.getPhrase('y13JskKf0')}</b><HelpIconView
                                    help_item_name={'bridge_eth_balance_required'}/>
                                </div>
                                <div>
                                    {Translation.getPhrase('Z154HHyBy')}
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
