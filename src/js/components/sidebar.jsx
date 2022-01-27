import React, {Component} from 'react';
import SideNav, {NavItem, NavText} from '@trendmicro/react-sidenav';
import {connect} from 'react-redux';
import {lockWallet} from '../redux/actions/index';
import moment from 'moment';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ModalView from './utils/modal-view';
import * as format from '../helper/format';


class Sidebar extends Component {
    constructor(props) {
        super(props);
        let now    = Date.now();
        this.state = {
            fileKeyExport: 'export_' + now,
            fileKeyImport: 'import_' + now,
            date         : new Date(),
            modalShow    : false
        };
    }

    componentDidMount() {
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    highlightSelected(defaultSelected) {

        if (defaultSelected === '/') {
            defaultSelected = '/wallet';
        }

        return defaultSelected;
    }

    isExpanded(section, defaultSelected) {

        let result = false;
        if (section === 'transaction' &&
            (
                (defaultSelected === '/unspent-transaction-output-list/pending') ||
                (defaultSelected === '/unspent-transaction-output-list/stable')
            )
        ) {
            result = true;
        }
        else if (section === 'status' &&
                 (
                     (defaultSelected === '/status-summary') ||
                     (defaultSelected === '/peers')
                 )
        ) {
            result = true;
        }
        else if (section === 'ads' &&
                 (
                     (defaultSelected === '/ad-create') ||
                     (defaultSelected === '/ad-list')
                 )
        ) {
            result = true;
        }
        else if (section === 'help' &&
                 (
                     (defaultSelected === '/faq') ||
                     (defaultSelected === '/report-issue')
                 )
        ) {
            result = true;
        }

        return result;
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
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
                           on_accept={() => props.lockWallet()}
                           body={<div>are you sure you want to logout?</div>}/>
                <div className="nav-utc_clock">
                    <span>{format.date(this.state.date)} utc</span>
                </div>
                <SideNav.Nav
                    selected={defaultSelected}
                >
                    <NavItem key={'wallet'} eventKey="/wallet">
                        <NavText>
                            home
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
                        <NavItem key={'unspent-transaction-output-list-pending'}
                                 eventKey="/unspent-transaction-output-list/pending">
                            <NavText>
                                pending unspents
                            </NavText>
                        </NavItem>
                        <NavItem key={'unspent-transaction-output-list-stable'}
                                 eventKey={'/unspent-transaction-output-list/stable'}>
                            <NavText>
                                stable unspents
                            </NavText>
                        </NavItem>
                    </NavItem>

                    <NavItem key={'advertisement-list'}
                             eventKey="/advertisement-list">
                        <NavText>
                            advertisements
                        </NavText>
                    </NavItem>

                    {/*
                     <NavItem key={'log'} eventKey="/log">
                     <NavText>
                     logs
                     </NavText>
                     </NavItem>
                     */}
                    <NavItem key={'config'} eventKey="/config">
                        <NavText>
                            settings
                        </NavText>
                    </NavItem>
                    <NavItem key={'actions'} eventKey="/actions">
                        <NavText>
                            actions
                        </NavText>
                    </NavItem>


                    <NavItem
                        eventKey="status"
                        expanded={this.isExpanded('status', defaultSelected)}
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
                                report problem
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
                    <span>version {props.node.node_version}</span>
                </div>
            </SideNav>
        </aside>);
    }
}


export default connect(
    state => state,
    {lockWallet}
)(Sidebar);
