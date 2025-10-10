import {
    ADD_LOG_EVENT,
    ADD_WALLET_CONFIG,
    ADD_STORAGE_CONFIG,
    CLEAR_TRANSACTION_DETAILS,
    LOCK_WALLET,
    SET_BACKLOG_SIZE,
    SET_LOG_SIZE,
    UNLOCK_WALLET,
    UPDATE_CLOCK,
    UPDATE_MESSAGE_STAT,
    UPDATE_NETWORK_CONNECTIONS,
    UPDATE_NETWORK_STATE,
    UPDATE_NODE_ATTRIBUTE,
    UPDATE_TRANSACTION_DETAILS,
    UPDATE_WALLET_ADDRESS_VERSION,
    UPDATE_WALLET_BALANCE,
    UPDATE_WALLET_CONFIG,
    UPDATE_WALLET_MAINTENANCE,
    UPDATE_WALLET_NOTIFICATION,
    UPDATE_WALLET_TRANSACTIONS,
    WALLET_READY,
    WALLET_VERSION_AVAILABLE,
    UPDATE_CURRENCY_PAIR_SUMMARY,
    UPDATE_NOTIFICATION_VOLUME
} from '../constants/action-types';
import API from '../../api/index';
import async from 'async';
import _ from 'lodash';
import localforage from 'localforage';


export function updateNodeAttribute(payload) {
    return {
        type: UPDATE_NODE_ATTRIBUTE,
        payload
    };
}

export function updateWalletNotification(payload) {
    return {
        type: UPDATE_WALLET_NOTIFICATION,
        payload
    };
}

export function walletUpdateTransactions(address_key_identifier) {
    return (dispatch) => API.getTransactionHistory(address_key_identifier)
                            .then(payload => dispatch({
                                type: UPDATE_WALLET_TRANSACTIONS,
                                payload
                            }));
}

export function updateWalletAddressVersion(payload) {
    return {
        type: UPDATE_WALLET_ADDRESS_VERSION,
        payload
    };
}

export function removeWalletAddressVersion(payload) {
    return (dispatch) => API.removeWalletAddressVersion(payload)
                            .then(() => {
                                    return new Promise(resolve => {
                                        API.listWalletAddressVersion()
                                           .then(list => {
                                               dispatch({
                                                   type   : UPDATE_WALLET_ADDRESS_VERSION,
                                                   payload: list
                                               });
                                               resolve();
                                           });
                                    });
                                }
                            );
}

export function unlockWallet(payload) {
    return {
        type: UNLOCK_WALLET,
        payload
    };
}

export function lockWallet(payload) {
    return (dispatch) => API.endSession()
                            .then(() => {
                                dispatch({
                                    type   : LOCK_WALLET,
                                    payload: payload || {
                                        isNew         : false,
                                        isImportWallet: false
                                    }
                                });
                            });
}

export function addWalletConfig(payload) {
    return {
        type: ADD_WALLET_CONFIG,
        payload
    };
}

export function addStorageConfig(payload) {
    return {
        type: ADD_STORAGE_CONFIG,
        payload
    };
}

export function walletUpdateConfig(payload) {
    return (dispatch) => {
        return new Promise(resolve => {
            async.each(_.keys(payload), (key, callback) => {
                API.updateNodeConfigValue(key, payload[key])
                   .then(() => callback());
            }, () => {
                API.reloadNodeConfigFromDatabase()
                   .then(() => {
                       dispatch({
                           type: UPDATE_WALLET_CONFIG,
                           payload
                       });
                       resolve();
                   });
            });
        });
    };
}

export function clearTransactionDetails() {
    return {type: CLEAR_TRANSACTION_DETAILS};
}

export function updateTransactionDetails(transactionID, shardID) {
    return (dispatch) => {
        API.getTransaction(transactionID, shardID)
           .then(payload => dispatch({
               type   : UPDATE_TRANSACTION_DETAILS,
               payload: payload
           }));
    };
}

export function walletReady(payload) {
    return {
        type: WALLET_READY,
        payload
    };
}

export function walletVersionAvailable(payload) {
    return {
        type: WALLET_VERSION_AVAILABLE,
        payload
    };
}

export function setBackLogSize(payload) {
    return {
        type: SET_BACKLOG_SIZE,
        payload
    };
}

export function setLogSize(payload) {
    return {
        type: SET_LOG_SIZE,
        payload
    };
}

export function addLogEvent(payload) {
    return {
        type: ADD_LOG_EVENT,
        payload
    };
}

export function updateNetworkState(payload) {
    return {
        type: UPDATE_NETWORK_STATE,
        payload
    };
}

export function updateNetworkConnections(payload) {
    return {
        type: UPDATE_NETWORK_CONNECTIONS,
        payload
    };
}

export function updateWalletMaintenance(payload) {
    return {
        type: UPDATE_WALLET_MAINTENANCE,
        payload
    };
}

export function updateNetworkNodeList() {
    return {};
}

export function walletUpdateBalance(payload) {
    return {
        type: UPDATE_WALLET_BALANCE,
        payload
    };
}

export function updateClock(clock) {
    return {
        type   : UPDATE_CLOCK,
        payload: {clock}
    };
}

export function updateCurrencyPairSummary(payload) {
    return {
        type: UPDATE_CURRENCY_PAIR_SUMMARY,
        payload
    };
}

export function updateNotificationVolume(volume) {
    return (dispatch) => {
        return localforage.setItem('notification_volume', volume, () => {
            return dispatch({
                type   : UPDATE_NOTIFICATION_VOLUME,
                payload: {volume}
            });
        });
    };
}

export function refreshNotificationVolume() {
    return (dispatch) => {
        return localforage.getItem('notification_volume',(volume) => {
            return dispatch({
                type   : UPDATE_NOTIFICATION_VOLUME,
                payload: {volume}
            });
        });
    };
}


export function updateMessageStat(payload) {
    return {
        type: UPDATE_MESSAGE_STAT,
        payload
    };
}
