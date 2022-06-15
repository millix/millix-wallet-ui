import {escape_url_param} from '../helper/security';
import {showErrorModalRequestApi} from '../components/utils/error-handler-request-api';
import _ from 'lodash';


class API {
    static HOST_MILLIX_API  = 'https://localhost:5500/api';
    static HOST_TANGLED_API = 'https://localhost:15555/api';

    constructor() {
        this.nodeID        = undefined;
        this.nodeSignature = undefined;

        try {
            const environment = require('../../environment');

            this.nodeID        = environment.NODE_ID;
            this.nodeSignature = environment.NODE_SIGNATURE;
        }
        catch (ex) {
        }
    }

    fetchApiTangled(url, result_param = {}, method = 'GET') {
        const absolute_url = this.getTangledApiURL() + url;

        return this.fetchApi(absolute_url, result_param, method);
    }

    fetchApiMillix(url, result_param = {}, method = 'GET', isMultipart = undefined) {
        try {
            const absolute_url = this.getAuthenticatedMillixApiURL() + url;
            return this.fetchApi(absolute_url, result_param, method, isMultipart);
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    fetchApi(url, resultParam = {}, method = 'GET', isMultipart = undefined) {
        let data = {};
        if (method === 'POST') {
            if (!isMultipart) {
                data = {
                    method : method,
                    headers: {'Content-Type': 'application/json'},
                    body   : JSON.stringify(resultParam)
                };
            }
            else {
                const formData = new FormData();
                _.each(_.keys(resultParam), key => {
                    if (resultParam[key] instanceof File) {
                        formData.append(key, resultParam[key]);
                        return;
                    }

                    formData.append(key, JSON.stringify(resultParam[key]));
                });
                data = {
                    method: method,
                    body  : formData
                };
            }
        }
        else {
            let param_string = '';
            if (resultParam) {
                const param_array = [];
                Object.keys(resultParam).forEach(function(param_key) {
                    let value = resultParam[param_key];
                    if (_.isArray(value) || typeof (value) === 'object') {
                        value = encodeURIComponent(JSON.stringify(value));
                    }

                    param_array.push(param_key + '=' + value);
                });
                if (param_array.length > 0) {
                    param_string = '?' + param_array.join('&');
                }
                url += param_string;
            }
        }

        return fetch(url, data)
            .then(response => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .catch(error => {
                showErrorModalRequestApi(error);

                return Promise.reject(error);
            })
            .catch(_ => Promise.reject({
                api_status : 'fail',
                api_message: `request error`
            })); // in case of failed request (e.g. connection refused) it prevents app from crash
    }

    setNodeID(nodeID) {
        this.nodeID = nodeID;
    }

    setNodeSignature(nodeSignature) {
        this.nodeSignature = nodeSignature;
    }

    getAuthenticatedMillixApiURL() {
        if (!this.nodeID || !this.nodeSignature) {
            throw Error('api is not ready');
        }
        return `${API.HOST_MILLIX_API}/${this.nodeID}/${this.nodeSignature}`;
    }

    getTangledApiURL() {
        return API.HOST_TANGLED_API;
    }

    getAdvertisementCategoryList() {
        return this.fetchApiTangled('/dAjjWCtPW1JbYwf6');
    }

    getAdvertisementLanguageList() {
        return this.fetchApiTangled('/wDqnBLvXY6FGUSfc');
    }

    getAdvertisementList() {
        return this.fetchApiTangled('/aerijOtODMtkHo6i');
    }

    getAdvertisementTypeList() {
        return this.fetchApiTangled('/jbUwv8IG6XeYMqCq');
    }

    listAdsLedgerDetails(from_unix_date) {
        return this.fetchApiTangled('/B1Gg7nMljx0yX9z9', {
            p0: from_unix_date
        });
    }

    toggleAdvertisementStatus(advertisement_guid) {
        return this.fetchApiTangled(`/C7neErVANMWXWuse`, {
            p0: {advertisement_guid: advertisement_guid}
        });
    }

    resetAdvertisement(advertisementGUID) {
        return this.fetchApiTangled(`/pKZdzEZrrdPA1jtl`, {
            p0: advertisementGUID
        });
    }

    getAdvertisementById(advertisement_id) {
        return this.fetchApiTangled('/ae60ccb743cd3c79', {
            p0: advertisement_id
        });
    }

    upsertAdvertisement(formData) {
        return this.fetchApiTangled(`/scWZ0yhuk5hHLd8s`, {
            p0: formData
        });
    }

    requestAdvertisementPayment(advertisementGUID) {
        return this.fetchApiTangled(`/QYEgbWuFZs5s7Kud`, {
            p0: advertisementGUID
        });
    }

    sendTransaction(transactionOutputPayload, withData = false, isBinary = false) {
        if (withData) {
            return this.sendTransactionWithData(transactionOutputPayload, isBinary);
        }
        else {
            return this.fetchApiMillix(`/XPzc85T3reYmGro1`, {
                p0: transactionOutputPayload
            }, 'POST');
        }
    }

    sendTransactionWithData(transactionOutputPayload, isBinary = false) {
        let data;
        if (isBinary) {
            const transactionData = transactionOutputPayload.transaction_data;
            delete transactionOutputPayload['transaction_data'];
            data = {
                p0: transactionOutputPayload,
                p1: transactionData
            };
        }
        else {
            data = {
                p0: transactionOutputPayload
            };
        }
        return this.fetchApiMillix(`/XQmpDjEVF691r2gX`, data, 'POST', isBinary);
    }

    listTransactionWithDataSent(addressKeyIdentifier, dataType) {
        return this.fetchApiMillix(`/F7APEv5JfCY1siyz`, {
            p9 : addressKeyIdentifier.startsWith('1') ? '0a30' : 'la3l',
            p10: addressKeyIdentifier,
            p11: 'Adl87cz8kC190Nqc',
            p12: dataType
        });
    }

    getStatsTransactionWithDataReceived(addressKeyIdentifier, dateBegin) {
        return this.fetchApiMillix(`/wWo8DCcoXVlpczoP`, {
            p0 : dateBegin,
            p9 : addressKeyIdentifier.startsWith('1') ? '0a30' : 'la3l',
            p10: addressKeyIdentifier,
            p11: 'Adl87cz8kC190Nqc'
        });
    }

    listTransactionWithDataReceived(addressKeyIdentifier, dataType) {
        return this.fetchApiMillix(`/Mu7VpxzfYyQimf3V`, {
            p9 : addressKeyIdentifier.startsWith('1') ? '0a30' : 'la3l',
            p10: addressKeyIdentifier,
            p11: 'Adl87cz8kC190Nqc',
            p12: dataType
        });
    }

    sendAggregationTransaction() {
        return this.fetchApiMillix(`/kC5N9Tz06b2rA4Pg`);
    }

    getWalletUnspentTransactionOutputList(addressKeyIdentifier, stable) {
        return this.fetchApiMillix(`/FDLyQ5uo5t7jltiQ`, {
            p3 : addressKeyIdentifier,
            p4 : 0,
            p7 : stable,
            p10: 0,
            p13: 'transaction_date desc'
        });
    }

    getTransactionHistory(addressKeyIdentifier) {
        return this.fetchApiMillix(`/w9UTTA7NXnEDUXhe`, {
            p0: addressKeyIdentifier
        });
    }

    getTransaction(transactionID, shardID) {
        return this.fetchApiMillix(`/IBHgAmydZbmTUAe8`, {
            p0: transactionID,
            p1: shardID
        });
    }

    getNodeStat() {
        return this.fetchApiMillix('/rKclyiLtHx0dx55M');
    }

    getUnspentOutputStat() {
        return this.fetchApiMillix('/FC8ylC617zzn1Gaa');
    }

    getNodeOsInfo() {
        return this.fetchApiMillix('/RLOk0Wji0lQVjynT');
    }

    getLatestMillixVersion() {
        return this.fetchApiMillix('/WGem8x5aycBqFXWQ');
    }

    getRandomMnemonic() {
        return this.fetchApiMillix('/Gox4NzTLDnpEr10v');
    }

    getFreeOutputs(addressKeyIdentifier) {
        return this.fetchApiMillix(`/FDLyQ5uo5t7jltiQ`, {
            p3 : addressKeyIdentifier,
            p4 : 0,
            p7 : 1,
            p10: 0
        });
    }

    verifyAddress(address) {
        return this.fetchApiMillix(`/Xim7SaikcsHICvfQ`, {
            p0: address
        });
    }

    newSessionWithPhrase(password, mnemonicPhrase) {
        password       = escape_url_param(password);
        mnemonicPhrase = escape_url_param(mnemonicPhrase);
        return this.fetchApiMillix(`/GktuwZlVP39gty6v`, {
            p0: password,
            p1: mnemonicPhrase
        });
    }

    newSession(password) {
        password = escape_url_param(password);
        return this.fetchApiMillix(`/PMW9LXqUv7vXLpbA`, {
            p0: password
        });
    }

    endSession() {
        return this.fetchApiMillix('/pIQZEKY4T9vttBUk');
    }

    getSession() {
        return this.fetchApiMillix('/OBexeX0f0MsnL1S3');
    }

    getNodeConfig() {
        return this.fetchApiMillix('/CZOTAF5LfusB1Ht5');
    }

    getIsPrivateKeyExist() {
        return this.fetchApiMillix('/LOLb7q23p8rYSLwv');
    }

    getMnemonicPhrase() {
        return this.fetchApiMillix('/BPZZ0l2nTfMSmmpl');
    }

    getEventLogList(limit = 1000) {
        return this.fetchApiMillix('/PZ7x3HVHVstLNYf0', {
            'p0': limit
        });
    }

    getNodeConfigValueByName(name) {
        return this.fetchApiMillix(`/2wYLWQfWBa6GLPYs`, {
            p0: name
        });
    }

    updateNodeConfigValue(key = null, value = null) {
        return this.getNodeConfigValueByName(key)
                   .then((config) => {
                       return this.fetchApiMillix(`/LLpSTquu4tZL8Nu5`,
                           {
                               p0: config.config_id,
                               p1: value
                           }, 'POST'
                       );
                   });
    }

    getNodePublicIP() {
        return this.fetchApiMillix(`/qRHogKQ1Bb7OT4N9`);
    }

    listWalletAddressVersion() {
        return this.fetchApiMillix(`/3XqkzNFzaTk1JPRf`);
    }

    addWalletAddressVersion(data) {
        return this.fetchApiMillix(`/hMrav9QMiMyLQosB`, {
            p0: data.version,
            p1: data.is_main_network,
            p2: data.regex_pattern,
            p3: data.is_default
        });
    }

    removeWalletAddressVersion(data) {
        return this.fetchApiMillix(`/XgxHmjINTEqANwtS`, {
            p0: data.version
        });
    }

    getNodeAboutAttribute() {
        return this.fetchApiMillix(`/AgsSNTSA0RHmWUkp`, {
            p0: this.nodeID,
            p1: 'ijDj2VlTyJBl5R4iTCmG'
        });
    }

    listAddresses(addressKeyIdentifier) {
        return this.fetchApiMillix(`/quIoaHsl8h6IwyEI`, {
            p0: addressKeyIdentifier
        });
    }

    getNextAddress() {
        return this.fetchApiMillix('/Lb2fuhVMDQm1DrLL');
    }

    interruptTransaction() {
        return this.fetchApiMillix('/RIlwZyfnizp2i8wh');
    }

    listActivePeers() {
        return this.fetchApiMillix(`/0eoUqXNE715mBVqV`, {
            p0: 2,
            p1: 'update_date desc'
        });
    }

    backlogList() {
        return this.fetchApiMillix('/0df01ae7dd51cec4');
    }

    backlogReset() {
        return this.fetchApiMillix('/epOW5kdvb12QdgsV');
    }

    getNodeAttributes(nodeID) {
        return this.fetchApiMillix(`/AgsSNTSA0RHmWUkp`, {
            p0: nodeID
        });
    }

    resetTransactionValidation() {
        return this.fetchApiMillix('/QISzUVake29059bi');
    }

    resetTransactionValidationByID(transaction_id = null) {
        let payload = [];
        if (typeof transaction_id === 'object') {
            transaction_id.forEach((item) => {
                if (typeof item.transaction_id !== 'undefined') {
                    payload.push(item.transaction_id);
                }
            });
        }
        else {
            payload.push(transaction_id);
        }

        return this.fetchApiMillix('/P2LMh8NsUTkpWAH3',
            {
                p0: payload
            },
            'POST'
        );
    }

    isDNSVerified(dns, addressKeyIdentified) {
        return this.fetchApiMillix('/DjwvDZ4bGUzKxOHW', {
            p0: dns,
            p1: addressKeyIdentified
        });
    }
}


const _API = new API();
export default _API;
