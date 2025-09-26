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

export function integer(field_name, value, error_list, allow_zero = false) {
    let value_escaped = value.toString().trim();
    value_escaped     = parseInt(value_escaped.replace(/[,.]/g, ''));

    if (!Number.isInteger(value_escaped)) {
        error_list.push({
            name   : get_error_name('value_is_not_integer', field_name),
            message: `${field_name} ${Translation.getPhrase('9efbcbf8f')}`
        });
    }
    else if (!allow_zero && value_escaped === 0) {
        error_list.push({
            name   : get_error_name('value_is_zero', field_name),
            message: `${field_name} is zero`
        });
    }

    return value_escaped;
}

export function floatPositiveInRange(field_name, value, error_list, allow_zero = false, minimum_value = Number.MIN_SAFE_INTEGER, maximum_value = Number.MAX_SAFE_INTEGER, value_float_precision = 0) {
    const value_escaped = floatPositive(field_name, value, error_list, allow_zero);
    if (!Number.isFinite(value_escaped) || value_escaped < minimum_value || value_escaped > maximum_value) {
        error_list.push({
            name   : get_error_name('value_not_in_range', field_name),
            message: `${field_name} must be in range [${format.get_fixed_value({
                value            : minimum_value,
                float_part_length: value_float_precision,
                trailing_zero    : false
            })} to ${format.get_fixed_value({
                value            : maximum_value,
                float_part_length: value_float_precision,
                trailing_zero    : false
            })}]`
        });
    }
    return value_escaped;
}

export function floatPositive(field_name, value, error_list, allow_zero = false) {
    let value_escaped = value.toString().trim();
    value_escaped     = parseFloat(value_escaped.replace(/,/g, ''));

    if (!Number.isFinite(value_escaped)) {
        error_list.push({
            name   : get_error_name('value_is_not_float', field_name),
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

export async function verified_sender_domain_name(value, address_identifier) {
    let error_list = [];
    if (!value) {
        return {
            valid     : true,
            error_list: error_list
        };
    }

    value = domain_name('domain_name', value, error_list);
    if (value === null) {
        return {
            valid     : false,
            error_list: error_list
        };
    }
    else {
        return API.isDNSVerified(value, address_identifier)
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
    if (e.target.value.length === 0 || allow_negative && e.target.value === '-') {
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

export function handleInputChangeFloat(e, allow_negative = true, formatter = 'number', maxDecimals = null, padDecimals = false) {
    let raw = e.target.value;

    if (raw.length === 0) {
        e.target.dataset.lastValue = '';
        return;
    }

    const cursorStart = e.target.selectionStart;
    const cursorEnd   = e.target.selectionEnd;

    const lastValue = e.target.dataset.lastValue || '';

    // Detect key pressed
    const key = e.nativeEvent.inputType; // 'deleteContentBackward' for backspace, 'deleteContentForward' for delete

    // --- Detect separator deletion (comma or dot) ---
    let deletedCharOffset = 0;
    if (lastValue && raw.length < lastValue.length) {
        const diffIndex   = cursorStart; // index where deletion occurred
        const deletedChar = lastValue[diffIndex];

        if (deletedChar === ',') {
            // User deleted a comma → remove the digit shift
            const match = raw.match(/(\d)(?=(\d{3})+([.|,](\d+)?.*)?$)/);
            if (match) {
                raw               = raw.slice(0, match.index) + raw.slice(match.index + 1);
                deletedCharOffset = 1;
            }
        }

        if (deletedChar === '.') {
            // User deleted a dot → re-insert dot one digit earlier
            const intPartLen = lastValue.split('.')[0].length;
            if (key === 'deleteContentBackward') {
                raw = (intPartLen > 0 ? raw.slice(0, intPartLen - 1) : '') + '.' + raw.slice(intPartLen);
            }
            else if (key === 'deleteContentForward') {
                raw = raw.slice(0, intPartLen) + '.' + raw.slice(intPartLen + 1);
            }
        }
    }

    // --- SPLIT INTO PARTS ---
    let [intPart, decPart = ''] = raw.split('.');

    // --- CLEAN INTEGER PART ---
    intPart = intPart.replace(/[^\d-]/g, '');

    if (allow_negative) {
        const isNegative = intPart.startsWith('-');
        intPart          = intPart.replace(/-/g, '');
        if (isNegative) {
            intPart = '-' + intPart;
        }
    }
    else {
        intPart = intPart.replace(/\D/g, '');
    }

    // --- CLEAN DECIMAL PART ---
    decPart       = decPart.replace(/\D/g, '');
    let padOffset = 0;
    if (maxDecimals !== null) {
        let oDecPart = decPart;
        decPart      = decPart.slice(0, maxDecimals);
        if (padDecimals) {
            decPart = decPart.padEnd(maxDecimals, '0');
        }

        if (oDecPart.length > decPart.length) {
            padOffset = 1;
        }
    }

    // --- FORMAT INTEGER PART ---
    let formattedInt = intPart;
    if (intPart !== '' && intPart !== '-' && !isNaN(Number(intPart))) {
        formattedInt = formatter === 'number'
                       ? format.number(Number(intPart))
                       : intPart;
        if (intPart.startsWith('-') && !formattedInt.startsWith('-')) {
            formattedInt = '-' + formattedInt;
        }
    }

    // --- REBUILD FINAL VALUE ---
    let newValue = formattedInt;
    if (maxDecimals !== null && padDecimals) {
        newValue = `${formattedInt}.${decPart}`;
    }
    else if (decPart.length > 0 || raw.endsWith('.')) {
        newValue = `${formattedInt}.${decPart}`;
    }

    if (newValue === '.') {
        newValue = '';
    }

    // --- CURSOR LOGIC ---
    const diff         = newValue.length - raw.length - deletedCharOffset + padOffset;
    let newCursorStart = cursorStart + diff;
    let newCursorEnd   = cursorEnd + diff;

    newCursorStart = Math.max(0, Math.min(newCursorStart, newValue.length));
    newCursorEnd   = Math.max(0, Math.min(newCursorEnd, newValue.length));

    // --- UPDATE INPUT ---
    e.target.value = newValue;
    e.target.setSelectionRange(newCursorStart, newCursorEnd);

    // --- STORE LAST VALUE PER INPUT ---
    e.target.dataset.lastValue = newValue;
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

export function domain_name(field_name, value, error_list) {
    const match = new RegExp('^([a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}$', 'gi');
    if (value && !match.test(value)) {
        error_list.push({
            name   : get_error_name('dns_invalid', field_name),
            message: `${field_name} ${Translation.getPhrase('0ccc5cddf')}`
        });
        return null;
    }
    return value;
}

export const validate_file_type_config = {
    image : {
        allowed_mime_type_list: [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif'
        ],
        allowed_extension_list: [
            'png',
            'jpeg',
            'jpg',
            'gif'
        ],
        allowed_max_file_size : 50 * 1024 * 1024 // 50mb
    },
    pdf   : {
        allowed_mime_type_list: [
            'application/pdf'
        ],
        allowed_extension_list: [
            'pdf'
        ],
        allowed_max_file_size : 50 * 1024 * 1024 // 50mb
    },
    binary: {
        allowed_mime_type_list: [
            '*'
        ],
        allowed_extension_list: [
            '*'
        ],
        allowed_max_file_size : 50 * 1024 * 1024 // 50mb
    },
    video : {
        allowed_mime_type_list: [
            'video/mp4',
            'video/quicktime',
            'video/x-flv',
            'video/mpeg',
            'video/x-ms-wmv',
            'video/x-msvideo',
            'video/avi',
            'video/webm',
            'video/ogg'
        ],
        allowed_extension_list: [
            'mp4',
            'mov',
            'flv',
            'avi',
            'mwv',
            'webm',
            'ogv'
        ],
        allowed_max_file_size : 50 * 1024 * 1024 // 50mb
    },
    text  : {
        allowed_mime_type_list: [
            'text/plain',
            'text/html',
            'text/css',
            'text/csv',
            'text/javascript',
            'text/markdown',
            'text/xml',
            'text/x-python',
            'text/x-c',
            'text/x-c++',
            'text/x-java-source',
            'text/x-shellscript',
            'text/x-asm',
            'text/x-perl',
            'text/x-ruby',
            'text/x-go',
            'text/x-lua',
            'text/x-sql',
            'text/x-vcard',
            'text/x-yaml',
            'text/x-json',
            'text/x-log',
            'text/x-tex',
            'text/richtext',
            'text/tab-separated-values',
            'text/vnd.wap.wml',
            'text/vnd.dvb.subtitle',
            'text/troff',
            'text/rtf',
            'text/calendar'
        ],
        allowed_extension_list: [
            'txt',     // text/plain
            'html',    // text/html
            'css',     // text/css
            'csv',     // text/csv
            'js',      // text/javascript
            'md',      // text/markdown
            'xml',     // text/xml
            'py',      // text/x-python
            'c',       // text/x-c
            'cpp',     // text/x-c++
            'java',    // text/x-java-source
            'sh',      // text/x-shellscript
            's',       // text/x-asm
            'pl',      // text/x-perl
            'rb',      // text/x-ruby
            'go',      // text/x-go
            'lua',     // text/x-lua
            'sql',     // text/x-sql
            'vcf',     // text/x-vcard
            'yaml',    // text/x-yaml
            'json',    // text/x-json
            'log',     // text/x-log
            'tex',     // text/x-tex
            'rtf',     // text/richtext / text/rtf
            'tsv',     // text/tab-separated-values
            'wml',     // text/vnd.wap.wml
            'sub',     // text/vnd.dvb.subtitle
            'tr',      // text/troff
            'rtf',     // text/rtf
            'ics'      // text/calendar
        ],
        allowed_max_file_size : 50 * 1024 * 1024 // 50mb
    }
};


function allowAny(list) {
    return list.length === 1 && list[0] === '*';
}

export function file(field_name, file, error_list, file_type_list = [], allowed_extension_list = [], allowed_mime_type_list = [], allowed_max_file_size = 0) {
    if (typeof file_type_list === 'string') {
        file_type_list = [file_type_list];
    }

    for (const file_type of file_type_list) {

        if (file_type === 'pdf' && file.file.type !== 'application/pdf') {
            continue;
        }
        if (file_type === 'video' && !file.file.type.startsWith('video/')) {
            continue;
        }
        if (file_type === 'image' && !file.file.type.startsWith('image/')) {
            continue;
        }
        if (file_type === 'text' && !file.file.type.startsWith('text/')) {
            continue;
        }

        let file_type_config = {
            allowed_mime_type_list: [],
            allowed_extension_list: [],
            allowed_max_file_size : 0
        };

        if (file_type && Object.keys(validate_file_type_config).includes(file_type)) {
            file_type_config = validate_file_type_config[file_type];
        }

        if (allowed_extension_list.length === 0) {
            allowed_extension_list = file_type_config.allowed_extension_list;
        }

        if (allowed_mime_type_list.length === 0) {
            allowed_mime_type_list = file_type_config.allowed_mime_type_list;
        }

        if (allowed_max_file_size <= 0) {
            allowed_max_file_size = file_type_config.allowed_max_file_size;
        }

        const file_extension = file.file.name.split('.').pop().toLowerCase();
        const file_mime_type = file.file.type;

        return new Promise((resolve, reject) => {
            if (!allowAny(allowed_extension_list) && allowed_extension_list.length > 0 && !allowed_extension_list.includes(file_extension)) {
                reject({
                    name   : get_error_name('invalid_file_extension', field_name),
                    message: `invalid file extension. allowed extensions are - ${allowed_extension_list.join(', ')}`
                });
                return null;
            }

            if (!allowAny(allowed_mime_type_list) && allowed_mime_type_list.length > 0 && !allowed_mime_type_list.includes(file_mime_type)) {
                reject({
                    name   : get_error_name('invalid_file_mime_type', field_name),
                    message: `invalid file mime type. allowed mime types are - ${allowed_mime_type_list.join(', ')}`
                });
                return null;
            }

            if (file.file.size > allowed_max_file_size) {
                reject({
                    name   : get_error_name('file_max_size', field_name),
                    message: `file size is too large. max allowed file size is ${(allowed_max_file_size / (1024 * 1024))}mb`
                });
                return null;
            }

            if (file_type === 'image') {
                const reader = new FileReader();

                reader.onload = e => {
                    const img   = new Image();
                    img.onload  = () => {
                        resolve(file);
                    };
                    img.onerror = () => {
                        reject({
                            name   : get_error_name('file_content_does_not_match_file_type', field_name),
                            message: `file is not a valid image.`
                        });
                        return false;
                    };
                    img.src     = e.target.result;
                };
                reader.readAsDataURL(file.file);
            }
            else if (file_type === 'video') {
                const reader = new FileReader();

                reader.onload = e => {
                    const video   = document.createElement('video');
                    video.preload = 'metadata';

                    video.onloadedmetadata = function() {
                        resolve(file);
                    };
                    video.onerror          = () => {
                        reject({
                            name   : get_error_name('file_content_does_not_match_file_type', field_name),
                            message: `file is not a valid video.`
                        });
                        return false;
                    };
                    video.src              = e.target.result;
                };
                reader.readAsDataURL(file.file);
            }
            else {
                resolve(file);
            }
        });
    }
}
