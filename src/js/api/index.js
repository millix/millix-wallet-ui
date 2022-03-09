import {escape_url_param} from '../helper/security';


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

    listCategories() {
        try {
            return fetch(this.getTangledApiURL() + '/dAjjWCtPW1JbYwf6')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listLanguages() {
        try {
            return fetch(this.getTangledApiURL() + '/wDqnBLvXY6FGUSfc')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listAds() {
        try {
            return fetch(this.getTangledApiURL() + '/aerijOtODMtkHo6i')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listAdTypes() {
        try {
            return fetch(this.getTangledApiURL() + '/jbUwv8IG6XeYMqCq')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    toggleAdStatus(advertisement_guid) {
        try {
            return fetch(this.getTangledApiURL() + `/C7neErVANMWXWuse?p0=${encodeURIComponent(JSON.stringify({advertisement_guid: advertisement_guid}))}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }

    }

    resetAd(advertisementGUID) {
        try {
            return fetch(this.getTangledApiURL() + `/pKZdzEZrrdPA1jtl?p0=${advertisementGUID}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }

    }

    submitAdForm(formData) {
        try {
            return fetch(this.getTangledApiURL() + `/scWZ0yhuk5hHLd8s?p0=${encodeURIComponent(JSON.stringify(formData))}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    requestAdvertisementPayment(advertisementGUID) {
        try {
            return fetch(this.getTangledApiURL() + `/QYEgbWuFZs5s7Kud?p0=${advertisementGUID}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    sendTransaction(transactionOutputPayload) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/XPzc85T3reYmGro1?p0=${JSON.stringify(transactionOutputPayload)}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getWalletUnspentTransactionOutputList(addressKeyIdentifier, stable) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=${stable}&p10=0&p13=transaction_date desc`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getTransactionHistory(addressKeyIdentifier) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/w9UTTA7NXnEDUXhe?p0=${addressKeyIdentifier}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getTransaction(transactionID, shardID) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/IBHgAmydZbmTUAe8?p0=${transactionID}&p1=${shardID}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeStat() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/rKclyiLtHx0dx55M')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeOsInfo() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/RLOk0Wji0lQVjynT')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getRandomMnemonic() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/Gox4NzTLDnpEr10v')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getFreeOutputs(addressKeyIdentifier) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=1&p10=0`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    verifyAddress(address) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/Xim7SaikcsHICvfQ?p0=${address}`)
                .then(response => response.json());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    newSessionWithPhrase(password, mnemonicPhrase) {
        try {
            password       = escape_url_param(password);
            mnemonicPhrase = escape_url_param(mnemonicPhrase);

            return fetch(this.getAuthenticatedMillixApiURL() + `/GktuwZlVP39gty6v?p0=${password}&p1=${mnemonicPhrase}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    newSession(password) {
        try {
            password = escape_url_param(password);
            return fetch(this.getAuthenticatedMillixApiURL() + `/PMW9LXqUv7vXLpbA?p0=${password}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    endSession() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/pIQZEKY4T9vttBUk')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getSession() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/OBexeX0f0MsnL1S3')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeConfig() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/CZOTAF5LfusB1Ht5')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getIsPrivateKeyExist() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/LOLb7q23p8rYSLwv')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeConfigValueByName(name) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/2wYLWQfWBa6GLPYs?p0=${name}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    updateNodeConfigValue(key = null, value = null) {
        try {
            return this.getNodeConfigValueByName(key)
                       .then((config) => {
                           try {
                               return fetch(
                                   this.getAuthenticatedMillixApiURL() + `/LLpSTquu4tZL8Nu5`,
                                   {
                                       method : 'POST',
                                       headers: {'Content-Type': 'application/json'},
                                       body   : JSON.stringify({
                                           'p0': config.config_id,
                                           'p1': value
                                       })
                                   }
                               )
                                   .then(response => response.ok ? response.json() : Promise.reject());
                           }
                           catch (e) {
                               return Promise.reject(e);
                           }
                       });
        }
        catch (e) {
            return Promise.reject();
        }
    }

    getNodePublicIP() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/qRHogKQ1Bb7OT4N9`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listWalletAddressVersion() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/3XqkzNFzaTk1JPRf`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    addWalletAddressVersion(data) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/hMrav9QMiMyLQosB?p0=${data.version}&p1=${data.is_main_network}&p2=${data.regex_pattern}&p3=${data.is_default}`)
                .then((response) => {
                    if (response.ok) {
                        try {
                            let response = this.listWalletAddressVersion();
                            return response;
                        }
                        catch (e) {
                            return Promise.reject(e);
                        }
                    }
                });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    removeWalletAddressVersion(data) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/XgxHmjINTEqANwtS?p0=${data.version}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeAboutAttribute() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/AgsSNTSA0RHmWUkp?p0=${this.nodeID}&p1=ijDj2VlTyJBl5R4iTCmG`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listAddresses(addressKeyIdentifier) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/quIoaHsl8h6IwyEI?&p0=${addressKeyIdentifier}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNextAddress() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/Lb2fuhVMDQm1DrLL')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    interruptTransaction() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/RIlwZyfnizp2i8wh')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listActivePeers() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/0eoUqXNE715mBVqV?p0=2&p1=update_date%20desc')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeAttributes(nodeID) {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + `/AgsSNTSA0RHmWUkp?p0=${nodeID}`)
                .then(response => {
                    return response.ok ? response.json() : Promise.reject();
                });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    resetTransactionValidation() {
        try {
            return fetch(this.getAuthenticatedMillixApiURL() + '/QISzUVake29059bi')
                .then(response => {
                    return response.ok ? response.json() : Promise.reject();
                });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    resetTransactionValidationByID(transaction_id = null) {
        let payload = [];
        if (typeof transaction_id === 'object') {
            transaction_id.forEach((item, idx) => {
                if (typeof item.transaction_id !== 'undefined') {
                    payload.push(item.transaction_id);
                }
            });
        }
        else {
            payload.push(transaction_id);
        }

        try {
            return fetch(
                this.getAuthenticatedMillixApiURL() + '/P2LMh8NsUTkpWAH3',
                {
                    method : 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body   : JSON.stringify({
                        'p0': payload
                    })
                }
            ).then(response => {
                return response.ok ? response.json() : Promise.reject();
            });
        }
        catch (e) {
            return Promise.reject();
        }
    }
}


const _API = new API();
export default _API;
