import API from '../api/index.js';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_ASSET_META, TRANSACTION_DATA_TYPE_NFT, TRANSACTION_DATA_TYPE_NFT_META} from '../../config';

const getImageFromApi = (transaction) => {
    return new Promise((resolve) => {
        const file_list    = transaction.transaction_output_attribute[0].value.file_list;
        const file_data    = transaction.transaction_output_attribute[0].file_data;
        const promise_list = [];
        for (const file of file_list) {
            if (!file_data[file.hash]) {
                let file_key = typeof (transaction.file_key) === 'undefined' ? '' : transaction.file_key;
                if (typeof (transaction.transaction_output_attribute[0].attribute_file_key[file.hash]) !== 'undefined') {
                    file_key = transaction.transaction_output_attribute[0].attribute_file_key[file.hash];
                }
                if (file_key === 'undefined') {
                    file_key = '';
                }

                promise_list.push(API.getTransactionOutputData({
                    ...transaction,
                    file_hash: file.hash,
                    file_key : file_key
                }));
            }
        }

        Promise.all(promise_list).then((transaction_output_data_list) => {
            return transaction_output_data_list.map((transaction_output_data_response, index) => {
                if (transaction_output_data_response.ok) {
                    const file_hash = file_list[index].hash;

                    return transaction_output_data_response.clone().json().then(transaction_output_data_json => {
                        file_data[file_hash] = transaction_output_data_json;
                    }).catch(_ => {
                        return transaction_output_data_response.clone().blob().then(blob => {
                            file_data[file_hash] = URL.createObjectURL(blob);
                        });
                    });
                }
            });
        }).then(result => {
            Promise.all(result).then(_ => {
                return resolve(nftImageData(transaction));
            });
        });
    });
};

function nftImageData(transaction) {
    const attribute                  = transaction.transaction_output_attribute[0];
    const file_list                  = attribute.value.file_list;
    const file_tangled_nft           = file_list.find(file => [
        TRANSACTION_DATA_TYPE_NFT,
        TRANSACTION_DATA_TYPE_ASSET
    ].includes(file.type));
    const file_data_tangled_nft      = attribute.file_data[file_tangled_nft?.hash];
    const file_tangled_nft_meta      = file_list.find(file => [
        TRANSACTION_DATA_TYPE_NFT_META,
        TRANSACTION_DATA_TYPE_ASSET_META
    ].includes(file.type));
    const file_data_tangled_nft_meta = attribute.file_data[file_tangled_nft_meta?.hash];
    let file_key                     = transaction.file_key;
    if (!file_key) {
        file_key = attribute.attribute_file_key[file_tangled_nft?.hash];
    }

    return {
        src                        : file_data_tangled_nft,
        width                      : 4,
        height                     : 3,
        transaction                : transaction,
        address_key_identifier_to  : transaction.address_key_identifier_to,
        address_key_identifier_from: transaction.address_key_identifier_from,
        amount                     : transaction.amount,
        txid                       : transaction.transaction_id,
        hash                       : file_tangled_nft?.hash,
        metadata_hash              : file_tangled_nft_meta?.hash,
        name                       : file_data_tangled_nft_meta?.name,
        description                : file_data_tangled_nft_meta?.description,
        attribute_type_id          : attribute.attribute_type_id,
        file_key                   : file_key,
        dns                        : attribute.value.dns
    };
}

function getNftViewLink(nft_data, absolute = false) {
    let origin = '';
    if (absolute) {
        origin = window.location.origin;
        try {
            let environment = require('../../environment');
            environment     = environment.default;
            if (environment.NFT_VIEW_LINK_ORIGIN) {
                origin = environment.NFT_VIEW_LINK_ORIGIN;
            }
        }
        catch (ex) {
        }
    }

    return `${origin}/nft-preview/?p0=${nft_data.transaction.transaction_id}&p1=${nft_data.transaction.address_key_identifier_to}&p2=${nft_data.file_key}&p3=${nft_data.hash}&p4=${nft_data.metadata_hash}`;
}

function is_main_network_address(address_key_identifier) {
    let is_main_network_address = true;
    if (address_key_identifier) {
        is_main_network_address = address_key_identifier.startsWith('1');
    }

    return is_main_network_address;
}

function get_address_version(address_key_identifier) {
    let version = '0b0';
    if (address_key_identifier) {
        version = is_main_network_address(address_key_identifier) ? '0b0' : 'lb0l';
    }

    return version;
}

export default {
    getImageFromApi,
    getNftViewLink,
    is_main_network_address,
    get_address_version
};
