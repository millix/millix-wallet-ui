import * as format from './format';
import _ from 'lodash';
import DatatableActionButtonView from '../components/utils/datatable-action-button-view';
import {Spinner} from 'react-bootstrap';
import React from 'react';
import Translation from '../common/translation';

export function datatable_format(data) {
    const message_list = [];
    data.forEach((transaction) => {
        transaction?.transaction_output_attribute.forEach(attribute => {
            if (attribute?.value) {
                const outputAttributeValue = attribute.value;
                if (!outputAttributeValue.file_data) {
                    return;
                }
                const fileHash = _.keys(outputAttributeValue.file_data)[0];
                const message  = !_.isNil(outputAttributeValue.file_data[fileHash]) ? outputAttributeValue.file_data[fileHash] : {};

                const {
                          message_subject,
                          message_body,
                          action_disabled
                      } = getMessageSubjectAndBody(message, transaction, outputAttributeValue.file_list, fileHash);

                message.subject = message_subject;
                message.message = message_body;

                const newRow = {
                    date        : format.date(transaction.transaction_date),
                    raw_date    : format.date(transaction.transaction_date),
                    txid        : transaction.transaction_id,
                    txid_parent : outputAttributeValue.parent_transaction_id,
                    dns         : outputAttributeValue.dns,
                    amount      : format.number(transaction.amount),
                    subject     : message.subject,
                    address_from: transaction.address_from,
                    address_to  : transaction.address_to,
                    message     : message.message,
                    sent        : false
                };

                let view_button = <DatatableActionButtonView
                    disabled={action_disabled}
                    history_path={'/message-view/' + encodeURIComponent(transaction.transaction_id)}
                    history_state={{...newRow}}
                    icon={'eye'}/>;

                newRow['action'] = <>
                    {view_button}
                    <DatatableActionButtonView
                        disabled={action_disabled}
                        history_path={'/message-compose/' + encodeURIComponent(transaction.transaction_id)}
                        history_state={{...newRow}}
                        icon={'reply'}/>
                    <DatatableActionButtonView
                        history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
                        history_state={{}}
                        icon={'th-list'}/>
                </>;


                newRow.date = <div className={'message_datatable_row_date'}>{newRow.date}{view_button}</div>;

                newRow.subject = get_subject_html(newRow);
                message_list.push(newRow);
            }
        });
    });

    return message_list;
}

function getMessageSubjectAndBody(message, transaction, file_list, fileHash) {
    let message_subject = message.subject;
    let message_body    = message.message;
    let action_disabled = false;

    let spinner_message = '';
    if (!transaction.is_stable) {
        action_disabled = true;
        spinner_message = Translation.getPhrase('b89f1d110');
    }
    else if (file_list.length > 0 && !fileHash) {
        action_disabled = true;
        spinner_message = Translation.getPhrase('b41465dc2');
    }

    if (spinner_message) {
        message_subject = <>
            <Spinner size={'sm'} animation="border" role="status">
                <span className="visually-hidden">{Translation.getPhrase('f709146cf')}</span>
            </Spinner>
            <span className="ms-2">
                <i>{spinner_message}</i>
            </span>
        </>;
        message_body    = <>
            <Spinner size={'sm'} animation="border" role="status">
                <span className="visually-hidden">{Translation.getPhrase('fed841f01')}</span>
            </Spinner>
            <span className="ms-2">
                <i>{spinner_message}</i>
            </span>
        </>;
    }

    return {
        message_subject,
        message_body,
        action_disabled
    };
}

export function get_subject_html(data) {
    let message_subject = '';
    if (!data) {
        message_subject = Translation.getPhrase('04c184362');
    }
    else if (!data.subject) {
        message_subject = <i>{Translation.getPhrase('e5250b452')}</i>;
    }
    else if (data.subject) {
        message_subject = data.subject;
    }

    return message_subject;
}
