import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {OverlayTrigger, Popover} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../../redux/actions';
import Translation from '../../common/translation';


class HelpIconView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    getHelpItem(help_item_name, args={}) {
        const props       = this.props;
        const result_help = {
            'pending_balance'             : {
                'title': Translation.getPhrase('ba921681e'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('fbbb6c10d', {
                            pending_transaction_link: <a
                                className={''}
                                key={'unspent-transaction-output-list-pending'}
                                onClick={() => this.props.history.push('/unspent-transaction-output-list/pending')}>{Translation.getPhrase('e5c8095c6')}</a>
                        })}
                    </li>
                    <li>
                        {Translation.getPhrase('5ed2b68c9')}
                    </li>
                    <li>
                        {Translation.getPhrase('7db0447cf', {
                            action_link: <a className={''}
                                            key={'actions'}
                                            onClick={() => this.props.history.push('/actions')}>{Translation.getPhrase('c19a1dff8')}</a>
                        })}
                    </li>
                </ul>
            },
            'network_state'               : {
                'title': Translation.getPhrase('0d38caf06'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('2c0096011')}
                    </li>
                    <li>
                        {Translation.getPhrase('7ab5eae48')}
                    </li>
                    <li>
                        {Translation.getPhrase('4ce630cbd')}
                    </li>
                    <li>
                        {Translation.getPhrase('02baec631', {
                            config_network_link: <a className={''}
                                                    key={'config-network'}
                                                    onClick={() => this.props.history.push('/config/network')}>{Translation.getPhrase('cd13bcc76')}</a>
                        })}
                    </li>
                </ul>
            },
            'transaction_max_input_number': {
                'title': Translation.getPhrase('61a640612'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('356c4bc00')}
                    </li>
                    <li>
                        {Translation.getPhrase('4a692995b')}
                    </li>
                    <li>
                        {Translation.getPhrase('834545039')}
                    </li>
                    <li>
                        {Translation.getPhrase('e90a9df2a', {
                            action_link: <a key={'actions'} className={''}
                                            onClick={() => this.props.history.push('/actions')}>{Translation.getPhrase('1cefbe2a2')}</a>
                        })}
                    </li>
                </ul>
            },
            'primary_address'             : {
                'title': Translation.getPhrase('8e70bcc2f'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('1d1cc8c3f')}
                    </li>
                    <li>
                        {Translation.getPhrase('3ad912efb')}
                    </li>
                    <li>
                        {Translation.getPhrase('fb152214f')}
                    </li>
                    <li>
                        {Translation.getPhrase('ad5364bf8')}
                    </li>
                    <li>
                        {Translation.getPhrase('59a9e0d55', {
                            address_list_link: <a
                                key={'address-list'}
                                className={''}
                                onClick={() => this.props.history.push('/address-list')}>here</a>
                        })}
                    </li>
                </ul>
            },
            'transaction_output'          : {
                'title': Translation.getPhrase('185bd5566'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('57db906ce')}
                    </li>
                    <li>
                        {Translation.getPhrase('7fed08a4d')}
                    </li>
                    <li>
                        {Translation.getPhrase('d304d8e4e')}
                    </li>
                    <li>
                        {Translation.getPhrase('ad5f8aa7b')}
                    </li>
                    <li>
                        {Translation.getPhrase('56f152128')}
                    </li>
                </ul>
            },
            'transaction_input'           : {
                'title': Translation.getPhrase('b766080f5'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('5c291a909')}
                    </li>
                    <li>
                        {Translation.getPhrase('2ad7a7942')}
                    </li>
                    <li>
                        {Translation.getPhrase('759e3b390')}
                    </li>
                </ul>
            },
            'transaction_status'          : {
                'title': Translation.getPhrase('d3281eae5'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('fb85ce31a')}
                    </li>
                    <li>
                        {Translation.getPhrase('80ea5b443')}
                    </li>
                    <li>
                        {Translation.getPhrase('2b2e0810f')}
                    </li>
                </ul>
            },
            'key_identifier'              : {
                'title': Translation.getPhrase('e2fd99059'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('b07f03d35')}
                    </li>
                    <li>
                        {Translation.getPhrase('1815bf605')}
                    </li>
                    <li>
                        {Translation.getPhrase('59c052874')}
                    </li>
                </ul>
            },
            'full_node'                   : {
                'title': Translation.getPhrase('38058c749'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('44d870c7d')}
                    </li>
                    <li>
                        {Translation.getPhrase('a9827cd5e')}
                    </li>
                    <li>
                        {Translation.getPhrase('81ebb8703')}
                    </li>
                </ul>
            },
            'full_storage'                : {
                'title': Translation.getPhrase('c9caccf1a'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('1427d4585')}
                    </li>
                    <li>
                        {Translation.getPhrase('492cade82')}
                    </li>
                </ul>
            },
            'transaction_fee_default'     : {
                'title': Translation.getPhrase('212f01b2c'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('60d6d30d7')}
                    </li>
                </ul>
            },
            'transaction_fee_proxy'       : {
                'title': Translation.getPhrase('ebc8ca440'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('2591b8258')}
                    </li>
                </ul>
            },
            'buy_and_sell'                : {
                'title': Translation.getPhrase('c9ef84af8'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('d33a93652', {
                            millix_link:
                                <a key={'millix-link'} href="" onClick={() => window.open('https://millix.com', '_blank').focus()}>millix.com</a>
                        })}
                    </li>
                </ul>
            },
            'node_ip'                     : {
                'title': Translation.getPhrase('76e16fae6'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('956b428d0')}
                    </li>
                </ul>
            },
            'api_port'                    : {
                'title': Translation.getPhrase('b98624a39'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('dcb93a1b4')}
                    </li>
                    <li>
                        {Translation.getPhrase('8e4265408')}
                    </li>
                </ul>
            },
            'max_connections_in'          : {
                'title': Translation.getPhrase('fcf2b2927'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('f82022ad0')}
                    </li>
                </ul>
            },
            'max_connections_out'         : {
                'title': Translation.getPhrase('5ca12f14c'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('140f3d658')}
                    </li>
                </ul>
            },
            'initial_peer_list'           : {
                'title': Translation.getPhrase('dae33f627'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('07cd495cd')}
                    </li>
                    <li>
                        {Translation.getPhrase('cf863a161')}
                    </li>
                </ul>
            },
            'verified_sender'             : {
                'title': Translation.getPhrase('f1bd8e1f1'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('84390853c')}
                    </li>
                    <li>
                        {Translation.getPhrase('7d659ee01')}
                    </li>
                    <li>
                        {Translation.getPhrase('671c0096a')}
                    </li>
                    <li>
                        {Translation.getPhrase('72c8961bc')}
                    </li>
                    <li>
                        {Translation.getPhrase('a963f26c4')} tangled={props.wallet.address_key_identifier}
                    </li>
                    <li>
                        {Translation.getPhrase('8c87872c5')}
                    </li>
                    <li>
                        {Translation.getPhrase('d17caffd0')}
                    </li>
                </ul>
            },
            'message_payment'             : {
                'title': Translation.getPhrase('6997ec114'),
                'body' : <ul>
                    <li>
                        {Translation.getPhrase('cdf38874f')}
                    </li>
                    <li>
                        {Translation.getPhrase('abe282fee')}
                    </li>
                    <li>
                        {Translation.getPhrase('c99fbcfeb')}
                    </li>
                </ul>
            },
            'nft'                         : {
                'title': 'nft',
                'body' : <ul>
                    <li>
                        be sure to protect your nfts by backing up your millix transaction database: {this.props.config.database_dir}
                    </li>
                    <li>
                        and the nft files: {this.props.config.file_dir}
                    </li>
                </ul>
            }
            ,
            'nft_trade': {
                'title': 'best practices for safely buying nfts',
                'body' : <ul>
                    <li>
                        there is no guarantee that this nft is currently owned by the person that sent you this preview link
                    </li>
                    <li>
                        use a trustworthy marketplace or escrow service
                    </li>
                    <li>
                        if the nft was recently minted continue to reload the page until the transaction is stable
                    </li>
                    <li>
                        if the nft was minted with a verified sender, examine the website to determine if it matches the nft and looks trustworthy
                    </li>
                </ul>
            }
            ,
            'auto_aggregation'           : {
                'title': Translation.getPhrase('BvHlTKiXV'),
                'body' : <ul>
                    <li>
                        auto-aggregation optimizes the funds in your wallet
                    </li>
                    <li>
                        when enabled, auto-aggregation runs every few minutes
                    </li>
                    <li>
                        you may see a pending balance in your wallet when auto-aggregation runs
                    </li>
                    <li>
                        disable auto-aggregation if you want to preserve the exact amount of payments
                    </li>
                </ul>
            },
            'contribute_to_translation'  : {
                'title': 'contribute to translation',
                'body' : <ul>
                    <li>
                        to contribute to translation in the dropdown below choose "yes" to see unique phrase identifiers
                    </li>
                    <li>
                        copy an identifier of a phrase, put it in a spreadsheet and add a translation that you think is correct next to it
                    </li>
                    <li>
                        send the spreadsheet to us and we will include it in one of next build, so you can enjoy a better interface
                    </li>
                    <li>
                        make sure you let us know which language you contribute to
                    </li>
                </ul>
            },
            'bridge_eth'                     : {
                'title': 'mlx - eth bridge',
                'body' : <ul>
                    <li>
                        the bridge
                        was built by the Millix Foundation (<a key={'millix-org-link'} href=""
                                                               onClick={() => window.open('https://millix.org', '_blank').focus()}>millix.org</a>)
                    </li>
                </ul>
            },
            'bridge_eth_exchange_rate'   : {
                'title': 'wmlx exchange rate',
                'body' : <ul>
                    <li>
                        to optimize compatibility there is an exchange rate of 1 wmlx = 1,000,000 mlx
                    </li>
                </ul>
            },
            'bridge_eth_balance_required': {
                'title': 'why do I need Ethereum balance?',
                'body' : <ul>
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
            },
            'bridge_eth_metamask': {
                'title': 'MetaMask',
                'body' : <ul>
                    <li>
                        It is a tool that connects you to the Ethereum network.
                    </li>
                    <li>
                        It allows you create a new Ethereum address, view your balance of wmlx and send wmlx.
                    </li>
                    <li>
                        It is installed as a browser extension and connects to your Millix wallet.
                    </li>
                </ul>
            },
            'bridge_eth_metamask_wallet': {
                'title': 'MetaMask wallet',
                'body' : <ul>
                    <li>
                        when you create a wallet on MetaMask it provides you with secure phrases that you can use to backup your MetaMask wallet
                    </li>
                </ul>
            },
            'bot_order_ttl': {
                'title': 'order time-to-live',
                'body' : <ul>
                    <li>
                        Order time-to-live applies to bid and ask strategy.  The time-to-live is the number of seconds the bid or ask exists in the order book before being deleted.
                    </li>
                </ul>
            },
            'bot_order_amount': {
                'title': 'order amount',
                'body' : <ul>
                    <li>
                        Order amount is the number of {args.base} that you want to execute each time the trading bot performs this strategy.
                    </li>
                </ul>
            },
            'bot_order_price_min': {
                'title': 'minimum price',
                'body' : <ul>
                    <li>
                        Minimum price is the lowest price of {args.base} in usdc acceptable for your trade strategy to exectute.
                    </li>
                </ul>
            },
            'bot_order_price_max': {
                'title': 'maximum price',
                'body' : <ul>
                    <li>
                        Maximum price is the highest price of {args.base} in usdc acceptable for your trade strategy to exectute.
                    </li>
                </ul>
            },
            'bot_order_total_budget': {
                'title': 'total budget',
                'body' : <ul>
                    <li>
                        Total budget is the limit of how many {args.base} will be transacted for this strategy before the bot stops executing.
                    </li>
                </ul>
            },
            'bot_order_frequency': {
                'title': 'frequency',
                'body' : <ul>
                    <li>
                        Frequency is the interval of seconds that this strategy is attempted.  If the value is 60 seconds the strategy will be attempted once per minute.
                    </li>
                </ul>
            },
            'bot_order_price_change': {
                'title': 'price change %',
                'body' : <ul>
                    <li>
                        The percentage change of the {args.base} price (example 5% or -5%)
                    </li>
                </ul>
            },
            'bot_order_price_change_time_frame': {
                'title': 'price change % time frame',
                'body' : <ul>
                    <li>
                        The time frame used to determine the percentage change of the price of {args.base} (example 15 minutes). The time frame also defines how often the strategy will be executed. If the strategy is set to a 15 minute price change % time frame, this strategy will only execute once per 15 minutes.
                    </li>
                </ul>
            },
            'bot_spread_percentage_begin': {
                'title': 'from spread %',
                'body' : <ul>
                    <li>
                        The minimum spread percentage at which this strategy begins placing orders.
                    </li>
                </ul>
            },
            'bot_spread_percentage_end': {
                'title': 'to spread %',
                'body' : <ul>
                    <li>
                        The maximum spread percentage up to which this strategy places orders.
                    </li>
                </ul>
            }
        };
        let help_item     = false;
        if (Object.keys(result_help).includes(help_item_name)) {
            help_item = result_help[help_item_name];
        }

        return help_item;
    }

    render() {
        const help_item = this.getHelpItem(this.props.help_item_name, this.props.args);
        if (!help_item) {
            return '';
        }

        const popoverFocus = (
            <Popover id="popover-basic">
                <Popover.Header>
                    <div className={'page_subtitle'}>
                        {help_item.title}
                    </div>
                </Popover.Header>
                <Popover.Body>{help_item.body}</Popover.Body>
            </Popover>
        );

        return (
            <>
                <OverlayTrigger
                    trigger={['click']}
                    placement="auto"
                    overlay={popoverFocus}
                >
                    <span className={'help_icon'}>
                    <FontAwesomeIcon
                        icon="chevron-down"
                        size="1x"/>
                        </span>
                </OverlayTrigger>
            </>
        );
    }
}


HelpIconView.propTypes = {
    help_item_name: PropTypes.any
};

export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    }), {
        updateNetworkState
    })(withRouter(HelpIconView));
