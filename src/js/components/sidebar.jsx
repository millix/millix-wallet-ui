import React, {Component} from 'react';
import SideNav, {NavItem, NavText} from '@trendmicro/react-sidenav';
import {connect} from 'react-redux';
import {lockWallet} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';
import API from '../api';
import {Badge} from 'react-bootstrap';
import {changeLoaderState} from './loader';
import Translation from '../common/translation';


class Sidebar extends Component {
    date  = Date.now();

    constructor(props) {
        super(props);
        let now    = Date.now();
        this.state = {
            fileKeyExport                : 'export_' + now,
            fileKeyImport                : 'import_' + now,
            modalShow                    : false,
            node_millix_version          : '',
            node_millix_version_available: '',
            application                  : '',
            ignore_is_expanded           : ''
        };

        this.setVersion = this.setVersion.bind(this);
    }

    componentDidMount() {
        this.setVersion();
        setInterval(this.setVersion, 5 * 60 * 1000);

        this.timerID = setInterval(
            () => this.tick(),
            1000
        );

        this.props.history.listen((location, action) => {
            this.setState({
                ignore_is_expanded: ''
            });
        });
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.date = new Date();
    }

    highlightSelected(defaultSelected) {

        if (defaultSelected === '/') {
            defaultSelected = '/wallet';
        }

        return defaultSelected;
    }

    getAvailableVersionLink() {
        let link = null;
        if (this.state.node_millix_version && this.state.node_millix_version !== this.state.node_millix_version_available) {
            let download_url = 'https://tangled.com/browser/download.php';
            if (this.state.application === 'client') {
                download_url = 'https://millix.org/client.html';
            }

            link = (
                <React.Fragment>
                    <a href={download_url} target={'_blank'} rel="noreferrer">
                        <Badge className={'new_version_badge'}>{Translation.getPhrase('e4a6a00d9')}</Badge>
                    </a>
                </React.Fragment>
            );
        }

        return link;
    }

    setVersion() {
        API.getLatestMillixVersion().then(response => {
            if (response.api_status === 'success') {
                this.setState({
                    node_millix_version_available: response.version_available,
                    application                  : response.application,
                    node_millix_version          : response.node_millix_version
                });
            }
        });
    }

    isExpanded(section, defaultSelected) {
        let result = false;
        if (!this.state.ignore_is_expanded || this.state.ignore_is_expanded !== defaultSelected) {
            const section_list = {
                transaction: [
                    '/transaction-list',
                    '/unspent-transaction-output-list/pending',
                    '/unspent-transaction-output-list/stable'
                ],
                status: [
                    '/status-summary',
                    '/peers',
                    '/backlog'
                ],
                advertisement: [
                    '/advertisement-list',
                    '/advertisement-received-list',
                ],
                config: [
                    '/config/general',
                    '/config/network',
                    '/config/connection',
                    '/config/consensus',
                    '/config/address-version',
                    '/config/storage',
                ],
                help: [
                    '/faq',
                    '/report-issue',
                    '/system-info'
                ],
                message: [
                    '/message-compose',
                    '/message-sent',
                    '/message-inbox',
                ],
                asset: [
                    '/asset-view'
                ],
                nft: [
                    '/nft-create',
                    '/nft-collection'
                ],
            };

            result = section_list[section].includes(defaultSelected);
        }

        return result;
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }

    lockWallet() {
        changeLoaderState(true);
        this.props.lockWallet().then(() => {
            changeLoaderState(false);
        });
    }

    getMessageCountBadge() {
        let message_count_badge = '';
        if (this.props.message_stat.count_received > 0) {
            message_count_badge = <Badge pill bg="primary" className={'message_inbox_count_badge'}>{this.props.message_stat.count_received}</Badge>;
        }

        return message_count_badge;
    }

    toggleParentNavigationItem(navigation_id) {
        let defaultSelected = this.highlightSelected(this.props.location.pathname);
        if (this.isExpanded(navigation_id, defaultSelected)) {
            this.setState({
                ignore_is_expanded: defaultSelected
            });
        }
    }

    render() {
        let props           = this.props;
        let defaultSelected = this.highlightSelected(props.location.pathname);

        return (<aside className={'navigation'} style={{
            height   : '100%',
            minHeight: '100vh'
        }}>
            <SideNav
                onToggle={() => {
                }}
                onSelect={(selected) => {
                    switch (selected) {
                        case 'lock':
                            this.changeModalShow(true);
                            break;
                        case 'resetValidation':
                            break;
                        default:
                            props.history.push(selected);
                    }
                }}
                expanded={true}
            >
                <ModalView show={this.state.modalShow}
                           size={'lg'}
                           on_close={() => this.changeModalShow(false)}
                           heading={Translation.getPhrase('1eacc1ecb')}
                           on_accept={() => {
                               this.lockWallet();
                           }}
                           body={<div>{Translation.getPhrase('9beb3bbfe')}</div>}/>
                <div className="nav-utc_clock">
                    <span>{format.date(this.date)} utc</span>
                </div>
                <SideNav.Nav
                    selected={defaultSelected}
                >
                    <NavItem key={'wallet'} eventKey="/wallet">
                        <NavText>
                            {Translation.getPhrase('6e649a063')}
                        </NavText>
                    </NavItem>

                    <NavItem key={'trade'}>
                        <NavText onClick={() => window.open('https://millix.com', '_blank').focus()}>
                            {Translation.getPhrase('14539e6a9')}
                        </NavText>
                    </NavItem>

                    <NavItem key={'address-list'} eventKey="/address-list">
                        <NavText>
                            {Translation.getPhrase('e37fc47fd')}
                        </NavText>
                    </NavItem>

                    <NavItem
                        eventKey="transaction"
                        expanded={this.isExpanded('transaction', defaultSelected)}
                        id="transaction"
                        onClick={() => this.toggleParentNavigationItem('transaction')}
                    >
                        <NavText>
                            {Translation.getPhrase('81af00358')} <FontAwesomeIcon className={'icon'}
                                                          icon="chevron-down"
                                                          size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'transaction-list'}
                                 eventKey="/transaction-list">
                            <NavText>
                                {Translation.getPhrase('62cf00f4c')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'unspent-transaction-output-list-stable'}
                                 eventKey={'/unspent-transaction-output-list/stable'}>
                            <NavText>
                                {Translation.getPhrase('a363c2282')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'unspent-transaction-output-list-pending'}
                                 eventKey="/unspent-transaction-output-list/pending">
                            <NavText>
                                {Translation.getPhrase('6b35a982d')}
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem
                        expanded={this.isExpanded('advertisement', defaultSelected)}
                        eventKey="advertisement"
                        id="advertisement"
                        onClick={() => this.toggleParentNavigationItem('advertisement')}

                    >
                        <NavText>
                            {Translation.getPhrase('b4c4bc1af')} <FontAwesomeIcon className={'icon'}
                                                            icon="chevron-down"
                                                            size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'advertisement-list'}
                                 eventKey="/advertisement-list">
                            <NavText>
                                {Translation.getPhrase('95b4575bd')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'advertisement-received-list'}
                                 eventKey="/advertisement-received-list">
                            <NavText>
                                {Translation.getPhrase('4c1eaa743')}
                            </NavText>
                        </NavItem>
                    </NavItem>
                    <NavItem
                        eventKey="asset"
                        expanded={this.isExpanded('asset', defaultSelected)}
                        className={'assetParent'}
                        id="asset"
                        onClick={() => this.toggleParentNavigationItem('asset')}
                    >
                        <NavText>
                            asset <FontAwesomeIcon className={'icon'}
                                                 icon="chevron-down"
                                                 size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'nft-create'}
                                 eventKey="/asset-view">
                            <NavText>
                                view
                            </NavText>
                        </NavItem>
                    </NavItem>
                    <NavItem
                        eventKey="nft"
                        expanded={this.isExpanded('nft', defaultSelected)}
                        className={'nftParent'}
                        id="nft"
                        onClick={() => this.toggleParentNavigationItem('nft')}
                    >
                        <NavText>
                            nft <FontAwesomeIcon className={'icon'}
                                                                                   icon="chevron-down"
                                                                                   size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'nft-create'}
                                 eventKey="/nft-create">
                            <NavText>
                                create
                            </NavText>
                        </NavItem>
                        <NavItem key={'nft-collection'}
                                 eventKey="/nft-collection">
                            <NavText>
                                collection
                            </NavText>
                        </NavItem>
                    </NavItem>
                    <NavItem
                        eventKey="message"
                        expanded={this.isExpanded('message', defaultSelected)}
                        className={'messageParent'}
                        id="message"
                        onClick={() => this.toggleParentNavigationItem('message')}
                    >
                        <NavText>
                            {Translation.getPhrase('f5f535670')}{this.getMessageCountBadge()} <FontAwesomeIcon className={'icon'}
                                                                                   icon="chevron-down"
                                                                                   size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'message-compose'}
                                 eventKey="/message-compose">
                            <NavText>
                                {Translation.getPhrase('9850ea52f')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'message-inbox'}
                                 eventKey={'/message-inbox'}>
                            <NavText>
                                {Translation.getPhrase('c6320dad7')}{this.getMessageCountBadge()}
                            </NavText>
                        </NavItem>
                        <NavItem key={'message-sent'}
                                 eventKey="/message-sent">
                            <NavText>
                                {Translation.getPhrase('fa7ef6bb8')}
                            </NavText>
                        </NavItem>
                    </NavItem>
                    <NavItem key={'actions'} eventKey="/actions">
                        <NavText>
                            {Translation.getPhrase('6714945be')}
                        </NavText>
                    </NavItem>

                    <NavItem
                        eventKey="status"
                        expanded={this.isExpanded('status', defaultSelected)}
                        id="status"
                        onClick={() => this.toggleParentNavigationItem('status')}
                    >
                        <NavText>
                            {Translation.getPhrase('657f2e9d7')} <FontAwesomeIcon className={'icon'}
                                                    icon="chevron-down"
                                                    size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'status-summary'}
                                 eventKey="/status-summary">
                            <NavText>
                                {Translation.getPhrase('5003fdb1b')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'peers'} eventKey="/peers">
                            <NavText>
                                {Translation.getPhrase('bacb9a402')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'backlog'} eventKey="/backlog">
                            <NavText>
                                {Translation.getPhrase('696f4f784')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'event-log'} eventKey="/event-log">
                            <NavText>
                                {Translation.getPhrase('72f996828')}
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem
                        eventKey="config"
                        expanded={this.isExpanded('config', defaultSelected)}
                        id="config"
                        onClick={() => this.toggleParentNavigationItem('config')}
                    >
                        <NavText>
                            {Translation.getPhrase('508a453d7')} <FontAwesomeIcon className={'icon'}
                                                      icon="chevron-down"
                                                      size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'config-general'}
                                 eventKey="/config/general">
                            <NavText>
                                {Translation.getPhrase('22918aaff')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-network'} eventKey="/config/network">
                            <NavText>
                                {Translation.getPhrase('0260ebda0')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-connection'} eventKey="/config/connection">
                            <NavText>
                                {Translation.getPhrase('7b46fa297')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-consensus'} eventKey="/config/consensus">
                            <NavText>
                                {Translation.getPhrase('f5762863c')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-address-version'} eventKey="/config/address-version">
                            <NavText>
                                {Translation.getPhrase('560869642')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-storage'} eventKey="/config/storage">
                            <NavText>
                                {Translation.getPhrase('6faf1e039')}
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem eventKey="help">
                        <NavText>
                            {Translation.getPhrase('b7ae09c4b')} <FontAwesomeIcon className={'icon'}
                                                  icon="chevron-down"
                                                  size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'faq'} eventKey="/faq">
                            <NavText>
                                {Translation.getPhrase('7697f394c')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'report-issue'} eventKey="/report-issue">
                            <NavText>
                                {Translation.getPhrase('eee2f4a78')}
                            </NavText>
                        </NavItem>
                        <NavItem key={'system-info'} eventKey="/system-info">
                            <NavText>
                                {Translation.getPhrase('8f9df8a04')}
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem key={'lock'} eventKey="lock">
                        <NavText>
                            {Translation.getPhrase('53c1d7458')}
                        </NavText>
                    </NavItem>
                </SideNav.Nav>
                <div className="nav-info">
                    <span>{Translation.getPhrase('6e1f4a9bd')} {this.state.node_millix_version}</span>
                    {this.getAvailableVersionLink()}
                </div>
            </SideNav>
        </aside>);
    }
}


export default connect(
    state => state,
    {lockWallet}
)(Sidebar);
