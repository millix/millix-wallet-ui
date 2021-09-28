class API {
    static HOST = 'https://localhost:5500/api';

    constructor() {
        this.nodeID        = undefined;
        this.nodeSignature = undefined;
    }

    setNodeID(nodeID) {
        this.nodeID = nodeID;
    }

    setNodeSignature(nodeSignature) {
        this.nodeSignature = nodeSignature;
    }

    getAuthenticatedURL() {
        if (!this.nodeID || !this.nodeSignature) {
            throw Error('api is not ready');
        }
        return `${API.HOST}/${this.nodeID}/${this.nodeSignature}`;
    }

    sendTransaction(transactionOutputPayload) {
        try {
            return fetch(this.getAuthenticatedURL() + `/XPzc85T3reYmGro1?p0=${JSON.stringify(transactionOutputPayload)}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getTransactionHistory(addressKeyIdentifier) {
        try {
            return fetch(this.getAuthenticatedURL() + `/w9UTTA7NXnEDUXhe?p0=${addressKeyIdentifier}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getTransaction(transactionID, shardID) {
        try {
            return fetch(this.getAuthenticatedURL() + `/IBHgAmydZbmTUAe8?p0=${transactionID}&p1=${shardID}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeStat() {
        try {
            return fetch(this.getAuthenticatedURL() + '/rKclyiLtHx0dx55M')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getRandomMnemonic() {
        try {
            return fetch(this.getAuthenticatedURL() + '/Gox4NzTLDnpEr10v')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getFreeOutputs(addressKeyIdentifier) {
        try {
            return fetch(this.getAuthenticatedURL() + `/FDLyQ5uo5t7jltiQ?p3=${addressKeyIdentifier}&p4=0&p7=1&p10=0`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    verifyAddress(address) {
        try {
            return fetch(this.getAuthenticatedURL() + `/Xim7SaikcsHICvfQ?p0=${address}`)
                .then(response => response.json());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    newSessionWithPhrase(password, mnemonicPhrase) {
        try {
            return fetch(this.getAuthenticatedURL() + `/GktuwZlVP39gty6v?p0=${password}&p1=${mnemonicPhrase}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    newSession(password) {
        try {
            return fetch(this.getAuthenticatedURL() + `/PMW9LXqUv7vXLpbA?p0=${password}`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    endSession() {
        try {
            return fetch(this.getAuthenticatedURL() + '/pIQZEKY4T9vttBUk')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getSession() {
        try {
            return fetch(this.getAuthenticatedURL() + '/OBexeX0f0MsnL1S3')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeConfig() {
        try {
            return fetch(this.getAuthenticatedURL() + '/CZOTAF5LfusB1Ht5')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeAboutAttribute() {
        try {
            return fetch(this.getAuthenticatedURL() + `/AgsSNTSA0RHmWUkp?p0=${this.nodeID}&p1=ijDj2VlTyJBl5R4iTCmG`)
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listAddresses() {
        try {
            return fetch(this.getAuthenticatedURL() + '/quIoaHsl8h6IwyEI')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNextAddress() {
        try {
            return fetch(this.getAuthenticatedURL() + '/Lb2fuhVMDQm1DrLL')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    interruptTransaction() {
        try {
            return fetch(this.getAuthenticatedURL() + '/RIlwZyfnizp2i8wh')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    listActivePeers() {
        try {
            return fetch(this.getAuthenticatedURL() + '/0eoUqXNE715mBVqV?p0=2&p1=update_date%20desc')
                .then(response => response.ok ? response.json() : Promise.reject());
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    getNodeAttributes(nodeID) {
        try {
            return fetch(this.getAuthenticatedURL() + `/AgsSNTSA0RHmWUkp?p0=${nodeID}`)
                .then(response => {
                    return response.ok ? response.json() : Promise.reject()
                });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }

    resetTransactionValidation() {
        try {
            return fetch(this.getAuthenticatedURL() + '/QISzUVake29059bi')
                .then(response => {
                    return response.ok ? response.json() : Promise.reject()
                });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
}


const _API = new API();
export default _API;
