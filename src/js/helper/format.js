import moment from 'moment';

export function millix(amount, appendName = true) {
    let result = amount;
    if (amount) {
        result = amount.toLocaleString('en-US');
        if (appendName) {
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

    return getFixedValue(param);
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

export function statusLabel(status) {
    return status ? 'active' : 'inactive';
}

export function boolLabel(value) {
    return value ? 'yes' : 'no';
}

export function transactionStatusLabel(status) {
    const resultStatus = {
        1: 'pending hibernation',
        2: 'hibernated',
        3: 'invalid'
    };

    let label = '';
    if (status && Object.keys(resultStatus).includes(status.toString())) {
        label = resultStatus[status];
    }

    return label;
}

function getFixedValue({
                           value = 0,
                           float_part_length: floatPartLength = 8,
                           format = true,
                           get_float    : getFloat = false,
                           format_zero  : formatZero = false,
                           trailing_zero: trailingZero = true
                       }) {
    if (!value && value !== 0) {
        value = 0;
    }

    if (value === 0 && formatZero === false) {
        if (getFloat) {
            return value;
        }

        return value.toString();
    }

    value = parseFloat(parseFloat(value).toFixed(floatPartLength));

    if (getFloat) {
        return value;
    }
    else {
        let options = {
            maximumFractionDigits: floatPartLength,
            useGrouping          : format
        };
        if (trailingZero) {
            options['minimumFractionDigits'] = floatPartLength;
        }

        return value.toLocaleString('en-US', options);
    }
}
