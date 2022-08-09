import moment from 'moment';
import Translation from '../common/translation';

export function millix(amount, append_name = true) {
    let result = amount;
    if (amount) {
        result = amount.toLocaleString('en-US');
        if (append_name) {
            result += ' millix';
        }
    }

    return result;
}

export function fiat(amount) {
    const param = {
        value      : amount,
        format_zero: false
    };

    if (amount > 1) {
        param.float_part_length = 2;
    }

    return get_fixed_value(param);
}

export function number(number) {
    if (number) {
        number = number.toLocaleString('en-US');
    }

    return number;
}

export function date(timestamp) {
    let result = '';
    if (timestamp) {
        if (moment.utc(timestamp).format('YYYY') === '1970') {
            timestamp = timestamp * 1000;
        }

        result = moment.utc(timestamp).format('YYYY-MM-DD HH:mm:ss');
    }

    return result;
}

export function status_label(status) {
    return status ? Translation.getPhrase('9f05ada1c') : Translation.getPhrase('144b89cb0');
}

export function bool_label(value) {
    return value ? Translation.getPhrase('33ea8716d') : Translation.getPhrase('84ec8187e');
}

export function transaction_status_label(status) {
    const result_status = {
        1: Translation.getPhrase('47a2508cd'),
        2: Translation.getPhrase('4ada43912'),
        3: Translation.getPhrase('eef5c6554')
    };

    let label = '';
    if (status && Object.keys(result_status).includes(status.toString())) {
        label = result_status[status];
    }

    return label;
}

function get_fixed_value({
                             value = 0,
                             float_part_length = 8,
                             format = true,
                             get_float = false,
                             format_zero = false,
                             trailing_zero = true
                         }) {
    if (!value && value !== 0) {
        value = 0;
    }

    if (value === 0 && format_zero === false) {
        if (get_float) {
            return value;
        }

        return value.toString();
    }

    value = parseFloat(parseFloat(value).toFixed(float_part_length));

    if (get_float) {
        return value;
    }
    else {
        let options = {
            maximumFractionDigits: float_part_length,
            useGrouping          : format
        };
        if (trailing_zero) {
            options['minimumFractionDigits'] = float_part_length;
        }

        return value.toLocaleString('en-US', options);
    }
}
