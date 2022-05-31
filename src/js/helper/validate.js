import * as format from './format';
import _ from 'lodash';

export function required(fieldName, value, errorList) {
    if (typeof value === 'string') {
        value = value.trim();
    }

    if (!value) {
        errorList.push({
            name   : getErrorName('required', fieldName),
            message: `${fieldName} is required`
        });
    }
    else if (_.isArray(value) && _.isEmpty(value)) {
        errorList.push({
            name   : getErrorName('required', fieldName),
            message: `${fieldName} is required`
        });
    }

    return value;
}

export function amount(fieldName, value, errorList, allow_zero = false) {
    const valueEscaped = integerPositive(fieldName, value, errorList, allow_zero);
    if (format.millix(valueEscaped, false) !== value) {
        errorList.push({
            name   : getErrorName('amount_format_is_wrong', fieldName),
            message: `${fieldName} must be a valid amount`
        });

    }

    return valueEscaped;
}

export function integerPositive(fieldName, value, errorList, allowZero = false) {
    let valueEscaped = value.toString().trim();
    valueEscaped     = parseInt(valueEscaped.replace(/\D/g, ''));

    if (!Number.isInteger(valueEscaped)) {
        errorList.push({
            name   : getErrorName('value_is_not_integer', fieldName),
            message: `${fieldName} must be a number`
        });
    }
    else if (!allowZero && valueEscaped <= 0) {
        errorList.push({
            name   : getErrorName('value_is_lt_zero', fieldName),
            message: `${fieldName} must be bigger than 0`
        });
    }
    else if (allowZero && valueEscaped < 0) {
        errorList.push({
            name   : getErrorName('value_is_lte_zero', fieldName),
            message: `${fieldName} must be bigger than or equal to 0`
        });
    }

    return valueEscaped;
}

export function ip(fieldName, value, errorList) {
    let valueEscaped  = [];
    let resultIpOctet = value.split('.');

    if (value === 'localhost') {
        valueEscaped = [value];
    }
    else if (resultIpOctet.length !== 4) {
        errorList.push({
            name   : getErrorName('ip_octet_number', fieldName),
            message: `${fieldName} must be a valid ip address`
        });
    }
    else {
        resultIpOctet.forEach(element => {
            const elementNumber = Number(element);
            if (isNaN(elementNumber) || elementNumber > 255 || elementNumber < 0 || element === '') {
                errorList.push({
                    name   : getErrorName('ip_octet_wrong', fieldName),
                    message: `${fieldName} must be a valid ip address`
                });

                return false;
            }
            valueEscaped.push(elementNumber);
        });
    }

    return valueEscaped.join('.');
}

export function string_alphanumeric(fieldName, value, errorList, length) {
    let valueEscaped = value.toString().trim();
    let isString     = /^[a-zA-Z0-9]+$/.test(valueEscaped);

    if (!isString) {
        errorList.push({
            name   : getErrorName('value_is_not_alphanumeric_string', fieldName),
            message: `${fieldName} must be alphanumeric string`
        });
    }

    if (valueEscaped.length > length) {
        errorList.push({
            name   : getErrorName('max_length_exceeded', fieldName),
            message: `${fieldName} max length is ${length} `
        });
    }

    return valueEscaped;
}

export function json(fieldName, value, errorList) {
    let result = value;

    try {
        result = JSON.parse(value);
    }
    catch (e) {
        errorList.push({
            name   : getErrorName('json_error', fieldName),
            message: `${fieldName} should contain valid json`
        });
    }

    return result;
}

function getErrorName(prefix, fieldName) {
    return `${prefix}_${fieldName.replaceAll(' ', '_')}`;
}

export function handleInputChangeInteger(e, allowNegative = true, formatter = 'number') {
    if (e.target.value.length === 0) {
        return;
    }

    let cursorStart = e.target.selectionStart,
        cursorEnd   = e.target.selectionEnd;
    let amount      = e.target.value.replace(/[,.]/g, '');
    if (!allowNegative) {
        amount = amount.replace(/-/g, '');
    }

    let offset = 0;
    if ((amount.length - 1) % 3 === 0) {
        offset = 1;
    }

    amount = parseInt(amount);

    let value = 0;
    if (!isNaN(amount)) {
        if (formatter === 'millix') {
            value = format.millix(amount, false);
        }
        else if (formatter === 'number') {
            value = format.number(amount);
        }
        else {
            value = amount;
        }
    }

    e.target.value = value;
    e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
}

export function handleInputChangeAlphanumericString(e, length = false) {
    if (e.target.value.length === 0) {
        return;
    }

    let value = e.target.value.replace(/[\W_]+/g, '');
    if (length !== false) {
        value = value.slice(0, length);
    }

    e.target.value = value;
}

export function handleAmountInputChange(e) {
    handleInputChangeInteger(e, false, 'millix');
}

export function handleInputChangeDNSString(e) {
    if (e.target.value.length === 0) {
        return;
    }

    e.target.value = e.target.value.replace(/[^a-z0-9\\.-]/g, '');
}

export function domainName(fieldName, domainName, errorList) {
    const match = new RegExp('^([a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}$', 'gi');
    if (domainName && !match.test(domainName)) {
        errorList.push({
            name   : getErrorName('dns_invalid', fieldName),
            message: `${fieldName} must be a valid domain name`
        });
        return null;
    }
    return domainName;
}
