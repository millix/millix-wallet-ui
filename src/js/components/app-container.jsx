import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import PropTypes from 'prop-types';
import WalletView from './wallet-view';
import ImportWalletView from './import-wallet-view';
import UnlockWalletView from './unlock-wallet-view';
import UnlockedWalletRequiredRoute from './utils/unlocked-wallet-required-route';
import TransactionHistoryView from './transaction-history-view';
import UnspentTransactionOutputView from './unspent-transaction-output-view';
import TransactionDetails from './transaction-details-view';
import PeerListView from './peer-list-view';
import PeerInfoView from './peer-info-view';
import AdvertisementFormView from './advertisement/advertisement-form-view';
import AdvertisementListView from './advertisement/advertisement-list-view';
import ActionView from './action-view';
import NewWalletView from './new-wallet-view';
import ManageWalletView from './manage-wallet-view';
import StatsView from './stats-view';
import BacklogView from './backlog-view';
import ReportIssueView from './help/report-issue-view';
import FaqView from './help/faq-view';
import SystemInfoView from './help/system-info-view';
import AddressListView from './address-list-view';
import MessageComposeView from './message/message-compose-view';
import MessageInboxView from './message/message-inbox-view';
import MessageSentView from './message/message-sent-view';
import MessageView from './message/message-view';
import ConfigGeneralView from './config/config-general-view';
import ConfigNetwork from './config/config-network-view';
import ConfigConnection from './config/config-connection-view';
import ConfigConsensus from './config/config-consensus-view';
import ConfigStorage from './config/config-storage-view';
import ConfigAddressVersion from './config/config-address-version-view';
import ErrorModalRequestApi from './utils/error-handler-request-api';
import AdvertisementConsumerSettlementLedgerView from './advertisement/advertisement-consumer-settlement-ledger-view';
import EventsLogView from './event-log-view';
import NftCreateView from './nft/nft-create-view';
import NftCollectionView from './nft/nft-collection-view';


class AppContainer extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return <Provider store={this.props.store}>
            <Router>
                <ErrorModalRequestApi/>
                <Switch>
                    <Route path="/unlock/" component={UnlockWalletView}/>
                    <Route path="/manage-wallet/" component={ManageWalletView}/>
                    <Route path="/new-wallet/" component={NewWalletView}/>
                    <Route path="/import-wallet/" component={ImportWalletView}/>

                    <UnlockedWalletRequiredRoute path="/advertisement-form"
                                                 component={AdvertisementFormView}/>
                    <UnlockedWalletRequiredRoute path="/advertisement-list"
                                                 component={AdvertisementListView}/>
                    <UnlockedWalletRequiredRoute path="/advertisement-received-list"
                                                 component={AdvertisementConsumerSettlementLedgerView}/>
                    <UnlockedWalletRequiredRoute path="/peers"
                                                 component={PeerListView}/>
                    <UnlockedWalletRequiredRoute path="/event-log"
                                                 component={EventsLogView}/>
                    <UnlockedWalletRequiredRoute path="/peer/:peer"
                                                 component={PeerInfoView}/>
                    <UnlockedWalletRequiredRoute path="/nft-create"
                                                 component={NftCreateView}/>
                    <UnlockedWalletRequiredRoute path="/nft-collection"
                                                 component={NftCollectionView}/>
                    <UnlockedWalletRequiredRoute path="/message-compose"
                                                 component={MessageComposeView}/>
                    <UnlockedWalletRequiredRoute path="/message-view"
                                                 component={MessageView}/>
                    <UnlockedWalletRequiredRoute path="/message-inbox"
                                                 component={MessageInboxView}/>
                    <UnlockedWalletRequiredRoute path="/message-sent"
                                                 component={MessageSentView}/>
                    <UnlockedWalletRequiredRoute path="/config/general"
                                                 component={ConfigGeneralView}/>
                    <UnlockedWalletRequiredRoute path="/config/network"
                                                 component={ConfigNetwork}/>
                    <UnlockedWalletRequiredRoute path="/config/connection"
                                                 component={ConfigConnection}/>
                    <UnlockedWalletRequiredRoute path="/config/consensus"
                                                 component={ConfigConsensus}/>
                    <UnlockedWalletRequiredRoute path="/config/storage"
                                                 component={ConfigStorage}/>
                    <UnlockedWalletRequiredRoute path="/config/address-version"
                                                 component={ConfigAddressVersion}/>
                    <UnlockedWalletRequiredRoute path="/actions"
                                                 component={ActionView}/>
                    <UnlockedWalletRequiredRoute path="/status-summary"
                                                 component={StatsView}/>
                    <UnlockedWalletRequiredRoute path="/backlog"
                                                 component={BacklogView}/>

                    <UnlockedWalletRequiredRoute path="/report-issue"
                                                 component={ReportIssueView}/>

                    <UnlockedWalletRequiredRoute
                        path="/transaction/:transaction_id"
                        component={TransactionDetails}/>
                    <UnlockedWalletRequiredRoute path="/address-list"
                                                 component={AddressListView}/>
                    <UnlockedWalletRequiredRoute path="/transaction-list"
                                                 component={TransactionHistoryView}/>
                    <UnlockedWalletRequiredRoute path="/faq"
                                                 component={FaqView}/>
                    <UnlockedWalletRequiredRoute path="/system-info"
                                                 component={SystemInfoView}/>
                    <UnlockedWalletRequiredRoute
                        path="/unspent-transaction-output-list/:state"
                        component={UnspentTransactionOutputView}/>
                    <UnlockedWalletRequiredRoute component={WalletView}/>
                </Switch>
            </Router>
        </Provider>;
    }
}


AppContainer.propTypes = {
    store: PropTypes.object.isRequired
};

export default AppContainer;
