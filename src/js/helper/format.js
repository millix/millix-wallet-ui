import moment from 'moment';

export function millix(amount, append_name = true) {
    let result = amount.toLocaleString('en-US');
    if (append_name) {
        result += ' millix';
    }

    return result;
}

export function fiat(amount) {
    return amount.toLocaleString('en-US');
}

export function number(number) {
    return number.toLocaleString('en-US');
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
    return status ? 'active' : 'inactive';
}

export function bool_label(value) {
    return value ? 'yes' : 'no';
}
