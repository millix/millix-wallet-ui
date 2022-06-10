import API from '../api';
import async from 'async';
import UserInterfaceError from '../components/utils/user-interface-error';


class Transaction {

    verifyAddress(transactionParams) {
        return new Promise((resolve, reject) => {
            const verifiedAddresses = [];
            async.eachSeries(transactionParams.addresses, (address, callback) => {
                API.verifyAddress(address)
                   .then(data => {
                       if (!data.is_valid) {
                           callback({
                               name   : 'address_invalid',
                               message: 'valid address is required'
                           });
                       }
                       else {
                           verifiedAddresses.push(data);
                           callback();
                       }
                   });
            }, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve({
                    error_list  : [],
                    address_list: verifiedAddresses,
                    amount      : transactionParams.amount,
                    fee         : transactionParams.fee,
                    subject     : transactionParams.subject,
                    message     : transactionParams.message,
                    dns         : transactionParams.dns
                });
            });
        });
    }

    sendTransaction(transaction_output_payload, with_data = false) {
        return new Promise((resolve, reject) => {
            API.sendTransaction(transaction_output_payload, with_data).then(data => {
                if (data.api_status === 'fail') {
                    return Promise.reject(data);
                }
                return data;
            }).then(data => {
                resolve(this.handleSuccessResponse(data));
            }).catch((e) => {
                reject(this.handleErrorResponse(e));
            });
        });
    }

    getModalBodySuccessResult(transaction_id) {
        return <div>
            <div>
                transaction id
            </div>
            <div>
                {transaction_id}
            </div>
        </div>;
    }

    handleErrorResponse(e) {
        let sendTransactionErrorMessage;
        let error_list = [];
        if (e !== 'validation_error') {
            if (e && e.api_message) {
                sendTransactionErrorMessage = <UserInterfaceError api_message={e.api_message}/>;
            }
            else {
                sendTransactionErrorMessage = `your transaction could not be sent: (${e?.api_message?.error.error || e?.api_message?.error || e?.message || e?.api_message || e || 'undefined behaviour'})`;
            }

            error_list.push({
                name   : 'sendTransactionError',
                message: sendTransactionErrorMessage
            });
        }

        return {
            error_list: error_list,
            sending   : false,
            canceling : false
        };
    }

    handleSuccessResponse(data) {
        const transaction = data.transaction.find(item => {
            return item.version.indexOf('0a') !== -1;
        });

        return {
            sending                 : false,
            fee_input_locked        : true,
            amount                  : '',
            subject                 : '',
            message                 : '',
            destination_address_list: [],
            address_verified_list   : [],
            modal_body_send_result  : this.getModalBodySuccessResult(transaction.transaction_id)
        };
    }
}


const _Transaction = new Transaction();
export default _Transaction;
