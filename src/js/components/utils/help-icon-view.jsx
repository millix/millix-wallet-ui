import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {OverlayTrigger, Popover} from 'react-bootstrap';


class HelpIconView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false
        };
    }

    getHelpItem(help_item_name) {
        const result_help = {
            'pending_balance'             : {
                'title': 'pending balance',
                'body' : <ul>
                    <li>
                        transactions appear as pending and included in pending
                        balance until they are validated by your node. you can
                        find a list of your pending transactions on this <a
                        className={''}
                        onClick={() => this.props.history.push('/unspent-transaction-output-list/pending')}>page</a>
                    </li>
                    <li>
                        it should not take more than 10-15 minutes to validate
                        transaction. if you observe pending balance for a longer
                        period of time it is recommended to restart your
                        node/browser
                    </li>
                    <li>
                        if step above didn't help it may help to perform reset
                        validation on this <a className={''}
                                              onClick={() => this.props.history.push('/actions')}>page</a>
                    </li>
                </ul>
            },
            'network_state'               : {
                'title': 'network state',
                'body' : <ul>
                    <li>
                        if your node is public it is more likely that you will
                        receive transaction fees
                    </li>
                    <li>
                        if your node is private you can still send and receive
                        transactions
                    </li>
                    <li>
                        if your node is private you will still receive payments
                        from advertisers
                    </li>
                    <li>
                        if you node is private you can use port forwarding on
                        your router to make your node public. you can edit your
                        node's network configuration <a className={''}
                                                        onClick={() => this.props.history.push('/config/network')}>here</a>
                    </li>
                </ul>
            },
            'transaction_max_input_number': {
                'title': 'transaction maximum input number',
                'body' : <ul>
                    <li>
                        the millix protocol limits each transaction to be funded by a maximum of 128 inputs
                    </li>
                    <li>
                        you can resolve this situation by aggregating your unspents manually before you send a large amount
                    </li>
                    <li>
                        you can aggregate your unspents manually by sending transactions to yourself
                    </li>
                    <li>
                        you can aggregate your unspents on this <a className={''} onClick={() => this.props.history.push('/actions')}>page</a>
                    </li>
                </ul>
            },
            'primary_address'             : {
                'title': 'primary address',
                'body' : <ul>
                    <li>
                        is the first address created by a new wallet
                    </li>
                    <li>
                        is the address announced by your node to the network
                    </li>
                    <li>
                        is the address where you receive transaction fees when
                        selected as a proxy
                    </li>
                    <li>
                        is the address where you receive advertisement payments
                    </li>
                    <li>
                        click <a
                        className={''}
                        onClick={() => this.props.history.push('/address-list')}>here</a> to
                        create new addresses and view existing addresses
                    </li>
                </ul>
            },
            'transaction_output'          : {
                'title': 'transaction output',
                'body' : <ul>
                    <li>
                        transaction outputs indicate an amount and an address
                        that millix was sent to
                    </li>
                    <li>
                        outputs in position -1 are the transaction fee that the
                        sender paid
                    </li>
                    <li>
                        there can be multiple outputs sent to multiple
                        recipients in a transaction
                    </li>
                    <li>
                        this can cause the total transaction amount to be larger
                        than the payment received by a specific address
                    </li>
                    <li>
                        when the sum of the inputs exceeds the fee and the
                        amount the sender is paying to recipients, an additional
                        output is created to send change back to the sender's
                        address
                    </li>
                </ul>
            },
            'transaction_input'           : {
                'title': 'transaction input',
                'body' : <ul>
                    <li>
                        transaction inputs are what the sender uses to fund a
                        transaction
                    </li>
                    <li>
                        there can be multiple inputs used to fund a transaction
                    </li>
                    <li>
                        inputs are related to transactions previously received
                        by the sender
                    </li>
                </ul>
            },
            'transaction_status'          : {
                'title': 'transaction status',
                'body' : <ul>
                    <li>
                        pending hibernation - this transaction was received less
                        than 10 minutes ago and may change.
                    </li>
                    <li>
                        hibernated - this transaction is hibernating and will
                        not change. before it can be used to fund a new
                        transaction it will be used to fund a refresh
                        transaction which will be validated by the network
                    </li>
                    <li>
                        invalid - there is something wrong with this
                        transaction. it could be improperly formatted
                    </li>
                </ul>
            },
            'key_identifier'              : {
                'title': 'key identifier',
                'body' : <ul>
                    <li>
                        key identifier is contained within each address available to the wallet
                    </li>
                    <li>
                        it identifies the wallet
                    </li>
                    <li>
                        wallet and all the addresses are associated with the key identifier
                    </li>
                </ul>
            },
            'full_node'                   : {
                'title': 'full node',
                'body' : <ul>
                    <li>
                        it is not required to send and receive transactions or receive payments from advertisers
                    </li>
                    <li>
                        it is recommended for devices with good bandwidth availability as it strengthens the millix network
                    </li>
                    <li>
                        it increases your ability and efficiency to earn fees from the millix network
                    </li>
                </ul>
            },
            'transaction_fee_default'     : {
                'title': 'default fee',
                'body' : <ul>
                    <li>
                        default fee you are willing to pay to send transaction
                    </li>
                </ul>
            },
            'transaction_fee_proxy'       : {
                'title': 'minimum proxy fee',
                'body' : <ul>
                    <li>
                        minimum fee your node will accept to verify transaction if it is chosen as proxy
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
        const help_item = this.getHelpItem(this.props.help_item_name);
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

export default withRouter(HelpIconView);
