import store from '../redux/store';
import {fiat as formatFiat} from './format';

export function fiat(amount, appendTicker = true) {
    let currencyPairSummary = store.getState().currency_pair_summary;
    let fiatValue           = formatFiat(amount * currencyPairSummary.price);
    if (appendTicker) {
        fiatValue += ' ' + currencyPairSummary.ticker;
    }

    return fiatValue;
}

export function isCurrencyPairSummaryAvailable() {
    return store.getState().currency_pair_summary.price > 0;
}
