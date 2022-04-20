import store from '../redux/store';
import {fiat as format_fiat} from './format';

export function fiat(amount, append_ticker = true) {
    let currency_pair_summary = store.getState().currency_pair_summary;
    let fiat_value            = format_fiat(amount * currency_pair_summary.price);
    if (append_ticker) {
        fiat_value += ' ' + currency_pair_summary.ticker;
    }

    return fiat_value;
}

export function is_currency_pair_summary_available() {
    return store.getState().currency_pair_summary.price > 0;
}
