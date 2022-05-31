import {
    ADD_LOG_EVENT, ADD_NEW_ADDRESS, ADD_WALLET_CONFIG, CLEAR_TRANSACTION_DETAILS,
    LOCK_WALLET, SET_BACKLOG_SIZE, SET_LOG_SIZE, UNLOCK_WALLET, UPDATE_CLOCK, UPDATE_NETWORK_CONNECTIONS,
    UPDATE_NETWORK_NODE_LIST, UPDATE_NETWORK_STATE, UPDATE_TRANSACTION_DETAILS,
    UPDATE_WALLET_ADDRESS, UPDATE_WALLET_CONFIG, UPDATE_WALLET_MAINTENANCE,
    UPDATE_WALLET_TRANSACTIONS, WALLET_READY, UPDATE_WALLET_ADDRESS_VERSION,
    GET_NODE_ATTRIBUTES, UPDATE_WALLET_BALANCE,
    WALLET_VERSION_AVAILABLE, UPDATE_WALLET_NOTIFICATION, UPDATE_NODE_ATTRIBUTE,
    UPDATE_NOTIFICATION_VOLUME, UPDATE_CURRENCY_PAIR_SUMMARY, UPDATE_MESSAGE_STAT
} from '../constants/action-types';
import config from '../../../config.js';

const initialState = {
    network              : {
        node_list             : [],
        node_online_list      : [],
        node_offline_list     : [],
        connections           : 0,
        enabled               : true,
        node_is_public        : 'unknown',
        node_public_ip        : 'unknown',
        node_id               : 'unknown',
        node_port             : 'unknown',
        online                : true,
        peer_count            : 'unknown',
        node_bind_ip          : 'unknown',
        node_network_addresses: []
    },
    wallet               : {
        id                               : undefined,
        unlocked                         : false,
        isReady                          : false,
        maintenance                      : false,
        addresses                        : [],
        transactions                     : [],
        address_version_list             : [],
        balance_stable                   : 0,
        balance_pending                  : 0,
        transaction_fee                  : 0,
        transaction_wallet_unstable_count: 0,
        transaction_count                : 0,
        notification_message             : undefined,
        version_available                : undefined
    },
    currency_pair_summary: {
        date_updated: undefined,
        price       : 0,
        ticker      : '',
        symbol      : ''
    },
    config               : {},
    clock                : 'not available...',
    log                  : {
        events: [],
        size  : 0
    },
    backlog              : {
        size: 0
    },
    transactionDetails   : null,
    node                 : {},
    notification         : {
        volume: 0
    },
    message_stat         : {}
};

function rootReducer(state = initialState, action) {
    if (window.parent) {
        window.parent.postMessage({
            type: 'wallet_update_state',
            action
        }, '*');
    }

    if (action.type === UNLOCK_WALLET) {
        // state = initialState; // todo: it cause empty config on login. use getNodeConfig() to populate
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                unlocked           : true,
                authenticationError: false,
                ...action.payload
            }
        });
    }
    else if (action.type === LOCK_WALLET) {
        state = initialState;
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                ...action.payload,
                unlocked: false
            }
        });
    }
    else if (action.type === WALLET_READY) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                ...action.payload
            }
        });
    }
    else if (action.type === UPDATE_NETWORK_STATE) {
        return Object.assign({}, state, {
            network: {
                ...state.network,
                ...action.payload
            }
        });
    }
    else if (action.type === UPDATE_NETWORK_NODE_LIST) {
        let nodeListOnline = state.network.node_online_list.map(item => item.node);
        return Object.assign({}, state, {
            network: {
                ...state.network,
                connections      : state.network.node_online_list.length,
                node_list        : [...action.payload],
                node_offline_list: action.payload.filter(item => !nodeListOnline.includes(item.node))
            }
        });
    }
    else if (action.type === UPDATE_NETWORK_CONNECTIONS) {
        let nodeListOnline = action.payload.map(item => item.node);
        return Object.assign({}, state, {
            network: {
                ...state.network,
                connections      : action.payload.length,
                node_online_list : [...action.payload],
                node_offline_list: state.network.node_list.filter(item => !nodeListOnline.includes(item.node))
            }
        });
    }
    else if (action.type === UPDATE_WALLET_ADDRESS) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                addresses: [...action.payload]
            }
        });
    }
    else if (action.type === ADD_NEW_ADDRESS) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                addresses: [
                    ...state.wallet.addresses,
                    {
                        ...action.payload,
                        balance: 0
                    }
                ]
            }
        });
    }
    else if (action.type === UPDATE_WALLET_TRANSACTIONS) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                transactions: [...action.payload]
            }
        });
    }
    else if (action.type === UPDATE_WALLET_MAINTENANCE) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                maintenance: action.payload
            }
        });
    }
    else if (action.type === ADD_LOG_EVENT) {
        let excess = (state.log.events.length + action.payload.length) - config.WALLET_LOG_SIZE_MAX;
        if (excess > 0) {
            state.log.events.splice(state.log.events.length - excess);
        }

        return Object.assign({}, state, {
            log: {
                events: [
                    ...action.payload,
                    ...state.log.events
                ],
                size  : state.log.size + action.payload.length
            }
        });
    }
    else if (action.type === CLEAR_TRANSACTION_DETAILS) {
        return Object.assign({}, state, {
            transactionDetails: null
        });
    }
    else if (action.type === UPDATE_TRANSACTION_DETAILS) {
        return Object.assign({}, state, {
            transactionDetails: {...action.payload}
        });
    }
    else if (action.type === ADD_WALLET_CONFIG) {
        return Object.assign({}, state, {
            config    : {...state.config, ...action.payload.config},
            configType: {...state.configType, ...action.payload.type}
        });
    }
    else if (action.type === UPDATE_WALLET_CONFIG) {
        return Object.assign({}, state, {
            config: {...state.config, ...action.payload}
        });
    }
    else if (action.type === UPDATE_CLOCK) {
        return Object.assign({}, state, {
            clock: action.payload.clock
        });
    }
    else if (action.type === SET_BACKLOG_SIZE) {
        return Object.assign({}, state, {
            backlog: {size: action.payload}
        });
    }
    else if (action.type === SET_LOG_SIZE) {
        return Object.assign({}, state, {
            log: {size: action.payload}
        });
    }
    else if (action.type === UPDATE_WALLET_ADDRESS_VERSION) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                address_version_list: [...action.payload]
            }
        });
    }
    else if (action.type === GET_NODE_ATTRIBUTES) {
        return Object.assign({}, state, {
            node: {
                attributes: [...action.payload]
            }
        });
    }
    else if (action.type === UPDATE_WALLET_BALANCE) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                ...action.payload
            }
        });
    }
    else if (action.type === UPDATE_CURRENCY_PAIR_SUMMARY) {
        let date_updated = new Date();
        return Object.assign({}, state, {
            currency_pair_summary: {
                date_updated: date_updated,
                ...action.payload
            }
        });
    }
    else if (action.type === WALLET_VERSION_AVAILABLE) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                version_available: action.payload
            }
        });
    }
    else if (action.type === UPDATE_WALLET_NOTIFICATION) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                notification_message: action.payload
            }
        });
    }
    else if (action.type === UPDATE_NODE_ATTRIBUTE) {
        return Object.assign({}, state, {
            node: {
                ...state.node,
                ...action.payload
            }
        });
    }
    else if (action.type === UPDATE_NOTIFICATION_VOLUME) {
        return Object.assign({}, state, {
            notification: {
                ...action.payload
            }
        });
    }
    else if (action.type === UPDATE_MESSAGE_STAT) {
        return Object.assign({}, state, {
            message_stat: {
                ...action.payload
            }
        });
    }

    return state;
}

export default rootReducer;
