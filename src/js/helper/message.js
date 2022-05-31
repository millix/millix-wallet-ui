import * as format from './format';
import _ from 'lodash';
import DatatableActionButtonView from '../components/utils/datatable-action-button-view';
import {Spinner} from 'react-bootstrap';
import React from 'react';

export function datatableFormat(data) {
    const messageList = [];
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
                          message_subject: messageSubject,
                          message_body   : messageBody,
                          action_disabled: actionDisabled
                      } = getMessageSubjectAndBody(message, transaction, outputAttributeValue.file_list, fileHash);

                message.subject = messageSubject;
                message.message = messageBody;

                const newRow = {
                    date        : format.date(transaction.transaction_date),
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

                let viewButton = <DatatableActionButtonView
                    disabled={actionDisabled}
                    history_path={'/message-view/' + encodeURIComponent(transaction.transaction_id)}
                    history_state={{...newRow}}
                    icon={'eye'}/>;

                newRow['action'] = <>
                    {viewButton}
                    <DatatableActionButtonView
                        disabled={actionDisabled}
                        history_path={'/message-compose/' + encodeURIComponent(transaction.transaction_id)}
                        history_state={{...newRow}}
                        icon={'reply'}/>
                    <DatatableActionButtonView
                        history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
                        history_state={{}}
                        icon={'th-list'}/>
                </>;


                newRow.date = <div className={'message_datatable_row_date'}>{newRow.date}{viewButton}</div>;

                newRow.subject = getSubjectHtml(newRow);
                messageList.push(newRow);
            }
        });
    });

    return messageList;
}

function getMessageSubjectAndBody(message, transaction, fileList, fileHash) {
    let messageSubject = message.subject;
    let messageBody    = message.message;
    let actionDisabled = false;

    let spinnerMessage = '';
    if (!transaction.is_stable) {
        actionDisabled = true;
        spinnerMessage = 'waiting for message transaction to validate';
    }
    else if (fileList.length > 0 && !fileHash) {
        actionDisabled = true;
        spinnerMessage = 'waiting for message data to arrive';
    }

    if (spinnerMessage) {
        messageSubject = <>
            <Spinner size={'sm'} animation="border" role="status">
                <span className="visually-hidden">loading...</span>
            </Spinner>
            <span className="ms-2">
                <i>{spinnerMessage}</i>
            </span>
        </>;
        messageBody    = <>
            <Spinner size={'sm'} animation="border" role="status">
                <span className="visually-hidden">loading...</span>
            </Spinner>
            <span className="ms-2">
                <i>{spinnerMessage}</i>
            </span>
        </>;
    }

    return {
        message_subject: messageSubject,
        message_body   : messageBody,
        action_disabled: actionDisabled
    };
}

export function getSubjectHtml(data) {
    let messageSubject = '';
    if (!data) {
        messageSubject = 'send message';
    }
    else if (!data.subject) {
        messageSubject = <i>no subject</i>;
    }
    else if (data.subject) {
        messageSubject = data.subject;
    }

    return messageSubject;
}
