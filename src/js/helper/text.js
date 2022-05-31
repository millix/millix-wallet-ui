import React from 'react';
import HelpIconView from '../components/utils/help-icon-view';
import * as format from './format';

export function getConfirmationModalQuestion() {
    return <div>are you sure you want to proceed?</div>;
}

export function getUiError(apiMessage) {
    let error        = '';
    let apiErrorName = 'unknown';

    if (typeof (apiMessage) === 'object') {
        let resultError = apiMessage.error;
        if (typeof (resultError?.error) !== 'undefined') {
            apiErrorName = resultError.error;
        }
        else {
            apiErrorName = resultError;
        }

        switch (apiErrorName) {
            case 'transaction_input_max_error':
                error = <>
                    your transaction tried to use too many outputs<HelpIconView help_item_name={'transaction_max_input_number'}/> please try to send a smaller
                    amount or click <a className={''} onClick={() => this.props.history.push('/actions')}>here</a> to use the balance aggregation tool to
                    optimize your balance. the max amount you can send is {format.millix(apiMessage.data.amount_max)}.</>;
                break;
            case 'insufficient_balance':
                error = <>your balance is lower than the amount you are trying to send. the max amount you can send
                    is {format.millix(apiMessage.data.balance_stable)}.</>;
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
                error = <>your transaction could not be sent: ({apiMessage?.error?.error || apiMessage?.error || apiMessage || 'undefined behaviour'})</>;
                break;
        }
    }
    else if (typeof (apiMessage) === 'string') {
        const match = /unexpected generic api error: \((?<message>.*)\)/.exec(apiMessage);
        error       = `your transaction could not be sent: (${match.groups.message})`;
    }

    return error;
}
