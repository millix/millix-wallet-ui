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
            'pending_balance': {
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
                        node/browser.
                    </li>
                    <li>
                        if step above didn't help it may help to perform reset
                        validation on this <a className={''}
                                              onClick={() => this.props.history.push('/actions')}>page</a>
                    </li>
                </ul>
            },
            'node_is_public' : {
                'title': 'is public?',
                'body' : <ul>
                    <li>
                        if your node is public it is much more likely that you
                        will
                        receive transactions' fee
                    </li>
                    <li>
                        if your node is private the chance to receive
                        transaction
                        fee is extremely low
                    </li>
                    <li>
                        if your node is private you can still send and receive
                        transactions
                    </li>
                    <li>
                        if your node is private you will still receive payments
                        for watching ads in tangled browser
                    </li>
                    <li>
                        if you node is not public you can use port forwarding
                        on your router to make your node public. you can edit
                        node's network configuration on this <a className={''}
                                                                onClick={() => this.props.history.push('/config')}>page</a>
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
                        icon="question-circle"
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
