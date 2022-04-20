import React from 'react';
import HelpIconView from '../components/utils/help-icon-view';
import * as format from './format';

export function get_confirmation_modal_question() {
    return <div>are you sure you want to proceed?</div>;
}

export function get_ui_error(api_message) {
    let error          = '';
    let api_error_name = 'unknown';

    if (typeof (api_message) === 'object') {
        let result_error = api_message.error;
        if (typeof (result_error?.error) !== 'undefined') {
            api_error_name = result_error.error;
        }
        else {
            api_error_name = result_error;
        }

        switch (api_error_name) {
            case 'transaction_input_max_error':
                error = <>your
                    transaction tried to use too many outputs<HelpIconView help_item_name={'transaction_max_input_number'}/>.
                    please try to send a smaller amount or aggregate manually by sending a smaller
                    amounts to yourself or aggregate unspents on this <a onClick={() => this.props.history.push('/actions')}>page</a>.
                    the max amount you can send is {format.millix(api_message.data.amount_max)}.</>;
                break;
            case 'insufficient_balance':
                error = <>your balance is lower than the amount you are trying to send. the max amount you can send
                    is {format.millix(api_message.data.balance_stable)}.</>;
                break;
            case 'transaction_send_interrupt':
                error = <>transaction has been canceled.</>;
                break;
            case 'proxy_not_found':
                error = <>proxy not found. please try again.</>;
                break;
            case 'transaction_proxy_rejected':
                error = <>transaction rejected by a proxy. please try again.</>;
                break;
            case 'aggregation_not_required':
                error = <>cannot process the request. the aggregation will generate on the same number of unspent deposits.</>;
                break;
            case 'aggregation_not_possible':
                error = <>cannot aggregate the unspent deposits. the transaction value is too small</>;
                break;
            default:
                error = <>your transaction could not be sent: ({api_message?.error?.error || api_message?.error || api_message || 'undefined behaviour'})</>
                break;
        }
    }
    else if (typeof (api_message) === 'string') {
        const match = /unexpected generic api error: \((?<message>.*)\)/.exec(api_message);
        error       = `your transaction could not be sent: (${match.groups.message})`;
    }

    return error;
}
