import React, {Component, useEffect} from 'react';
import SideNav, {NavItem, NavText} from '@trendmicro/react-sidenav';
import {connect} from 'react-redux';
import {lockWallet} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';
import API from '../api';
import {Badge} from 'react-bootstrap';
import {changeLoaderState} from './loader';


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

        this.props.history.listen((location, action) => {
            this.setState({
                ignore_is_expanded: ''
            });
        });
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
                        <Badge className={'new_version_badge'}>new version available</Badge>
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
                           heading={'logout'}
                           on_accept={() => {
                               this.lockWallet();
                           }}
                           body={<div>are you sure you want to logout?</div>}/>
                <div className="nav-utc_clock">
                    <span>{format.date(this.date)} utc</span>
                </div>
                <SideNav.Nav
                    selected={defaultSelected}
                >
                    <NavItem key={'wallet'} eventKey="/wallet">
                        <NavText>
                            home
                        </NavText>
                    </NavItem>

                    <NavItem key={'trade'}>
                        <NavText onClick={() => window.open('https://millix.com', '_blank').focus()}>
                            trade
                        </NavText>
                    </NavItem>

                    <NavItem key={'address-list'} eventKey="/address-list">
                        <NavText>
                            addresses
                        </NavText>
                    </NavItem>

                    <NavItem
                        eventKey="transaction"
                        expanded={this.isExpanded('transaction', defaultSelected)}
                        id="transaction"
                        onClick={() => this.toggleParentNavigationItem('transaction')}
                    >
                        <NavText>
                            transactions <FontAwesomeIcon className={'icon'}
                                                          icon="chevron-down"
                                                          size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'transaction-list'}
                                 eventKey="/transaction-list">
                            <NavText>
                                all
                            </NavText>
                        </NavItem>
                        <NavItem key={'unspent-transaction-output-list-stable'}
                                 eventKey={'/unspent-transaction-output-list/stable'}>
                            <NavText>
                                stable unspents
                            </NavText>
                        </NavItem>
                        <NavItem key={'unspent-transaction-output-list-pending'}
                                 eventKey="/unspent-transaction-output-list/pending">
                            <NavText>
                                pending unspents
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
                            advertisements <FontAwesomeIcon className={'icon'}
                                                            icon="chevron-down"
                                                            size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'advertisement-list'}
                                 eventKey="/advertisement-list">
                            <NavText>
                                list
                            </NavText>
                        </NavItem>
                        <NavItem key={'advertisement-received-list'}
                                 eventKey="/advertisement-received-list">
                            <NavText>
                                received
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
                            messages{this.getMessageCountBadge()} <FontAwesomeIcon className={'icon'}
                                                                                   icon="chevron-down"
                                                                                   size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'message-compose'}
                                 eventKey="/message-compose">
                            <NavText>
                                compose
                            </NavText>
                        </NavItem>
                        <NavItem key={'message-inbox'}
                                 eventKey={'/message-inbox'}>
                            <NavText>
                                inbox{this.getMessageCountBadge()}
                            </NavText>
                        </NavItem>
                        <NavItem key={'message-sent'}
                                 eventKey="/message-sent">
                            <NavText>
                                sent
                            </NavText>
                        </NavItem>
                    </NavItem>
                    <NavItem key={'actions'} eventKey="/actions">
                        <NavText>
                            actions
                        </NavText>
                    </NavItem>

                    <NavItem
                        eventKey="status"
                        expanded={this.isExpanded('status', defaultSelected)}
                        id="status"
                        onClick={() => this.toggleParentNavigationItem('status')}
                    >
                        <NavText>
                            status <FontAwesomeIcon className={'icon'}
                                                    icon="chevron-down"
                                                    size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'status-summary'}
                                 eventKey="/status-summary">
                            <NavText>
                                summary
                            </NavText>
                        </NavItem>
                        <NavItem key={'peers'} eventKey="/peers">
                            <NavText>
                                peers
                            </NavText>
                        </NavItem>
                        <NavItem key={'backlog'} eventKey="/backlog">
                            <NavText>
                                backlog
                            </NavText>
                        </NavItem>
                        <NavItem key={'event-log'} eventKey="/event-log">
                            <NavText>
                                event log
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
                            settings <FontAwesomeIcon className={'icon'}
                                                      icon="chevron-down"
                                                      size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'config-general'}
                                 eventKey="/config/general">
                            <NavText>
                                general
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-network'} eventKey="/config/network">
                            <NavText>
                                network
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-connection'} eventKey="/config/connection">
                            <NavText>
                                connection
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-consensus'} eventKey="/config/consensus">
                            <NavText>
                                consensus
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-address-version'} eventKey="/config/address-version">
                            <NavText>
                                address version
                            </NavText>
                        </NavItem>
                        <NavItem key={'config-storage'} eventKey="/config/storage">
                            <NavText>
                                storage
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem eventKey="help">
                        <NavText>
                            help <FontAwesomeIcon className={'icon'}
                                                  icon="chevron-down"
                                                  size="1x"/>
                            <FontAwesomeIcon className={'icon hidden'}
                                             icon="chevron-up"
                                             size="1x"/>
                        </NavText>
                        <NavItem key={'faq'} eventKey="/faq">
                            <NavText>
                                frequent questions
                            </NavText>
                        </NavItem>
                        <NavItem key={'report-issue'} eventKey="/report-issue">
                            <NavText>
                                report issue
                            </NavText>
                        </NavItem>
                        <NavItem key={'system-info'} eventKey="/system-info">
                            <NavText>
                                system info
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem key={'lock'} eventKey="lock">
                        <NavText>
                            logout
                        </NavText>
                    </NavItem>
                </SideNav.Nav>
                <div className="nav-info">
                    <span>version {this.state.node_millix_version}</span>
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
