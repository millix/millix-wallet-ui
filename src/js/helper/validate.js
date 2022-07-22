import * as format from './format';
import _ from 'lodash';
import Translation from '../common/translation';
import API from '../api';
import HelpIconView from '../components/utils/help-icon-view';

export function required(field_name, value, error_list) {
    if (typeof value === 'string') {
        value = value.trim();
    }

    if (!value) {
        error_list.push({
            name   : get_error_name('required', field_name),
            message: `${field_name} ${Translation.getPhrase('e1787ec8a')}`
        });
    }
    else if (_.isArray(value) && _.isEmpty(value)) {
        error_list.push({
            name   : get_error_name('required', field_name),
            message: `${field_name} ${Translation.getPhrase('e1787ec8a')}`
        });
    }

    return value;
}

export function amount(field_name, value, error_list, allow_zero = false) {
    const value_escaped = integerPositive(field_name, value, error_list, allow_zero);
    if (format.millix(value_escaped, false) !== value) {
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} ${Translation.getPhrase('8704a6404')}`
        });

    }

    return value_escaped;
}

export function integerPositive(field_name, value, error_list, allow_zero = false) {
    let value_escaped = value.toString().trim();
    value_escaped     = parseInt(value_escaped.replace(/\D/g, ''));

    if (!Number.isInteger(value_escaped)) {
        error_list.push({
            name   : get_error_name('value_is_not_integer', field_name),
            message: `${field_name} ${Translation.getPhrase('9efbcbf8f')}`
        });
    }
    else if (!allow_zero && value_escaped <= 0) {
        error_list.push({
            name   : get_error_name('value_is_lt_zero', field_name),
            message: `${field_name} ${Translation.getPhrase('020c0fa2c')}`
        });
    }
    else if (allow_zero && value_escaped < 0) {
        error_list.push({
            name   : get_error_name('value_is_lte_zero', field_name),
            message: `${field_name} ${Translation.getPhrase('ed23a3bf1')}`
        });
    }

    return value_escaped;
}

export function ip(field_name, value, error_list) {
    let value_escaped   = [];
    let result_ip_octet = value.split('.');

    if (value === 'localhost') {
        value_escaped = [value];
    }
    else if (result_ip_octet.length !== 4) {
        error_list.push({
            name   : get_error_name('ip_octet_number', field_name),
            message: `${field_name} ${Translation.getPhrase('c07a618ad')}`
        });
    }
    else {
        result_ip_octet.forEach(element => {
            const element_number = Number(element);
            if (isNaN(element_number) || element_number > 255 || element_number < 0 || element === '') {
                error_list.push({
                    name   : get_error_name('ip_octet_wrong', field_name),
                    message: `${field_name} ${Translation.getPhrase('37372b72f')}`
                });

                return false;
            }
            value_escaped.push(element_number);
        });
    }

    return value_escaped.join('.');
}

export async function verified_sender_domain_name(domain_name, address_identifier) {
    let error_list = [];
    if (!domain_name) {
        return {
            valid     : true,
            error_list: error_list
        };
    }

    domain_name = this.domain_name('domain_name', domain_name, error_list);
    if (domain_name === null) {
        return {
            valid     : false,
            error_list: error_list
        };
    }
    else {
        return API.isDNSVerified(domain_name, address_identifier)
                  .then(data => {
                      if (!data.is_address_verified) {
                          error_list.push({
                              name   : 'verified_sender_not_valid',
                              message: <>domain name verification failed. click<HelpIconView help_item_name={'verified_sender'}/> for instructions</>
                          });
                      }
                      return {
                          valid     : !!data.is_address_verified,
                          error_list: error_list
                      };
                  })
                  .catch(() => {
                      return {
                          valid     : false,
                          error_list: [
                              {
                                  name   : 'api error',
                                  message: 'domain name verification failed. please try again later'
                              }
                          ]
                      };
                  });
    }
}

export function string_alphanumeric(field_name, value, error_list, length) {
    let value_escaped = value.toString().trim();
    let is_string     = /^[a-zA-Z0-9]+$/.test(value_escaped);

    if (!is_string) {
        error_list.push({
            name   : get_error_name('value_is_not_alphanumeric_string', field_name),
            message: `${field_name} ${Translation.getPhrase('891fa1a8b')}`
        });
    }

    if (value_escaped.length > length) {
        error_list.push({
            name   : get_error_name('max_length_exceeded', field_name),
            message: `${field_name} ${Translation.getPhrase('cdd550227')} ${length} `
        });
    }

    return value_escaped;
}

export function json(field_name, value, error_list) {
    let result = value;

    try {
        result = JSON.parse(value);
    }
    catch (e) {
        error_list.push({
            name   : get_error_name('json_error', field_name),
            message: `${field_name} ${Translation.getPhrase('3719db17c')}`
        });
    }

    return result;
}

function get_error_name(prefix, field_name) {
    return `${prefix}_${field_name.replaceAll(' ', '_')}`;
}

export function handleInputChangeInteger(e, allow_negative = true, formatter = 'number') {
    if (e.target.value.length === 0) {
        return;
    }

    let cursorStart = e.target.selectionStart,
        cursorEnd   = e.target.selectionEnd;
    let amount      = e.target.value.replace(/[,.]/g, '');
    if (!allow_negative) {
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

export function handleDomainNameInputChange(e) {
    if (e.target.value.length === 0) {
        return;
    }

    e.target.value = e.target.value.replace(/[^a-z0-9\\.-]/g, '');
}

export function domain_name(field_name, domain_name, error_list) {
    const match = new RegExp('^([a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}$', 'gi');
    if (domain_name && !match.test(domain_name)) {
        error_list.push({
            name   : get_error_name('dns_invalid', field_name),
            message: `${field_name} ${Translation.getPhrase('0ccc5cddf')}`
        });
        return null;
    }
    return domain_name;
}
