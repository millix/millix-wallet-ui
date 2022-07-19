const const_value_default = {
    'GENESIS_TRANSACTION_ID': '2VngVznbdiQ5tqfWqn2NMP8DijqCbLX79Gygo9yYRVFU6iN35h',
    'GENESIS_SHARD_ID'      : 'qGuUgMMVmaCvqrvoWG6zARjkrujGMpzJmpNhBgz1y3RjBG7ZR'
};

let environment;
try {
    environment = require('./environment');
    environment = environment.default;
}
catch (ex) {
}

function get_const_value(const_name) {
    if (!const_value_default[const_name]) {
        throw 'const_value_default is not defined for ' + const_name;
    }

    let value = const_value_default[const_name];
    if (environment && typeof (environment[const_name]) !== 'undefined') {
        value = environment[const_name];
    }

    return value;
}


export const WALLET_LOG_SIZE_MAX = 1000;

export const GENESIS_TRANSACTION_ID = get_const_value('GENESIS_TRANSACTION_ID');
export const GENESIS_SHARD_ID       = get_const_value('GENESIS_SHARD_ID');

export const CURRENCY_PAIR_SUMMARY_REFRESH_INTERVAL_MS = 10 * 60000;
export const DISCORD_URL                               = 'https://discord.com/invite/nb5uaKq4yX';
export const REPORT_ISSUE_ADDRESS                      = 'tA6KT866gnf9UbqwNwvs67SYPXk4Jgm1Y9z43H5YZKdw0b01H6GPn9imdJCGuoxa5syub43JuW4Fi14DA';

export const TRANSACTION_DATA_TYPE_ASSET       = 'tangled_asset';
export const TRANSACTION_DATA_TYPE_TRANSACTION = 'transaction';
export const TRANSACTION_DATA_TYPE_MESSENGER   = 'tangled_messenger';
export const TRANSACTION_DATA_TYPE_NFT         = 'tangled_nft';
export const DEFAULT_NFT_CREATE_AMOUNT         = 10000;
export const DEFAULT_NFT_CREATE_FEE            = 1000;
const config                                   = {
    WALLET_LOG_SIZE_MAX,
    GENESIS_TRANSACTION_ID,
    GENESIS_SHARD_ID,
    CURRENCY_PAIR_SUMMARY_REFRESH_INTERVAL_MS,
    DISCORD_URL
};

export default config;
