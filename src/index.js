import React from 'react';
import ReactDOM from 'react-dom';
import AppContainer from './js/components/app-container';
import store from './js/redux/store';
import {unlockWallet, updateClock, addWalletConfig, updateNodeAttribute, updateWalletAddressVersion} from './js/redux/actions';
import reportWebVitals from './reportWebVitals';
import {config as faConfig, library} from '@fortawesome/fontawesome-svg-core';
import {
    faArrowCircleLeft,
    faBook,
    faClock,
    faCloudDownloadAlt,
    faCompressArrowsAlt,
    faExchangeAlt,
    faFingerprint,
    faHeartbeat,
    faHome,
    faKey,
    faMicrochip,
    faPlus,
    faPowerOff,
    faSignOutAlt,
    faSlidersH,
    faStream,
    faTrash,
    faUndo,
    faUndoAlt,
    faUserClock,
    faWallet,
    faLock,
    faLockOpen,
    faTimes,
    faEye,
    faList,
    faBars,
    faChevronDown,
    faChevronUp,
    faSignInAlt,
    faFileImport,
    faPencilAlt,
    faSync,
    faPlusCircle,
    faPlay,
    faPause,
    faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import './vendor/animate.css/animate.css';
import './css/bootstrap/bootstrap.scss';

import 'primereact/resources/themes/bootstrap4-dark-purple/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import './vendor/luna/custom_form_element.css';
import './vendor/luna/datatable.css';
import './vendor/luna/datepicker.css';
import './vendor/luna/universal_admin.css';

import '../node_modules/@trendmicro/react-sidenav/dist/react-sidenav.css';
import '../node_modules/@fortawesome/fontawesome-svg-core/styles.css';
import './css/app.scss';
import './vendor/luna/luna';
import API from './js/api';
import ntp from './js/core/ntp';
import moment from 'moment';
import localforage from 'localforage';

faConfig.autoAddCss = false;
library.add(faArrowCircleLeft, faWallet, faKey, faHome, faFingerprint,
    faStream, faExchangeAlt, faCloudDownloadAlt, faSlidersH,
    faSignOutAlt, faPlus, faHeartbeat, faUndoAlt, faTrash, faUndo,
    faBook, faMicrochip, faPowerOff, faUserClock, faClock, faCompressArrowsAlt,
    faLock, faLockOpen, faTimes, faEye, faList, faBars, faSignInAlt, faFileImport,
    faChevronDown, faChevronUp, faPencilAlt, faSync, faPlusCircle, faPlay,
    faPause, faQuestionCircle);


let apiInfo = {
    node_id       : undefined,
    node_signature: undefined
};
localforage.getItem('api_info', (err, data) => {
    if (err || !data) {
        return;
    }
    apiInfo = JSON.parse(data);
    apiInfo.node_id && API.setNodeID(apiInfo.node_id);
    apiInfo.node_signature && API.setNodeSignature(apiInfo.node_signature);
    API.getSession()
       .then(data => {
           if (data.api_status === 'success') {
               store.dispatch(unlockWallet(data.wallet));
           }
       });
});

window.addEventListener('message', (e) => {
    const {data} = e;
    if (data.type === 'update_api') {
        let update = false;
        console.log('update api info');
        if (data.node_id) {
            API.setNodeID(data.node_id);
            apiInfo.node_id = data.node_id;
            update          = true;
        }
        if (data.node_signature) {
            API.setNodeSignature(data.node_signature);
            apiInfo.node_signature = data.node_signature;
            update                 = true;
        }
        if (update) {
            localforage.setItem('api_info', JSON.stringify(apiInfo));
        }
        e.stopImmediatePropagation();
    }
    else if (data.type === 'unlock_wallet') {
        console.log('unlock password');
        API.newSession(data.password)
           .then(data => {
               if (data.api_status === 'success') {
                   store.dispatch(unlockWallet(data.wallet));
               }
           });
        e.stopImmediatePropagation();
    }
});

setInterval(() => {
    if (!ntp.initialized || !store.getState().wallet.unlocked) {
        return;
    }

    let clock = new Date();
    clock.setUTCMilliseconds(clock.getUTCMilliseconds() + ntp.offset);
    store.dispatch(updateClock(moment.utc(clock).format('HH:mm:ss')));
}, 900);

const getNodeAboutAttribute = () => {
    if (!store.getState().node.node_version) {
        API.getNodeAboutAttribute()
           .then(attribute => {
               store.dispatch(updateNodeAttribute(attribute[0].value));
           }).catch(() => setTimeout(getNodeAboutAttribute, 2000));
    }
};

const getNodeConfig = () => {
    if (Object.keys(store.getState().config).length === 0) {
        API.getNodeConfig()
           .then(configList => {
               const newConfig = {
                   config    : {},
                   configType: {}
               };
               configList.forEach(config => {
                   newConfig.config[config.config_name]     = config.type !== 'string' ? JSON.parse(config.value) : config.value;
                   newConfig.configType[config.config_name] = config.type;
               });
               store.dispatch(addWalletConfig(newConfig));
           }).catch(() => setTimeout(getNodeConfig, 2000));
    }
};

const getWalletAddressVersion = () => {
    if (Object.keys(store.getState().wallet.addresses).length === 0) {
        API.listWalletAddressVersion()
           .then(addressVersion => {
               store.dispatch(updateWalletAddressVersion(addressVersion));
           }).catch(() => setTimeout(getWalletAddressVersion, 2000));
    }
};

getNodeAboutAttribute();
getNodeConfig();
getWalletAddressVersion();
ReactDOM.render(
    <React.StrictMode>
        <AppContainer store={store}/>
    </React.StrictMode>,
    document.getElementById('app')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
