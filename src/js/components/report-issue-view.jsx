import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';

import os from 'os';
import API from '../api';
import moment from 'moment';


class ReportIssueView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeOsInfo    : {
                arch                  : '',
                memory                : {
                    free       : '',
                    freePercent: '',
                    total      : '',
                    freemem    : ''
                },
                cpu                   : {
                    model  : '',
                    speed  : '',
                    loadavg: []
                },
                platform              : '',
                release               : '',
                type                  : '',
                node_millix_version   : '',
                node_millix_build_date: ''
            },
            browserRelease: os.release()
        };
    }

    componentDidMount() {
        API.getNodeOsInfo().then(response => {
            this.setState({
                nodeOsInfo: response
            });
        });
    }

    render() {
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    report problem
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <Col>
                            <div className={'section_title'}>
                                instructions
                            </div>
                            <div className={'form-group'}>
                                <div>to report about a problem please follow these steps:</div>
                                <ul>
                                    <li>describe current behavior</li>
                                    <li>describe expected behavior</li>
                                    <li>add information provided on this page</li>
                                    <li>send it to us on discord</li>
                                </ul>
                            </div>

                            <div className={'section_title'}>
                                version
                            </div>
                            <div className={'form-group'}>
                                <label>build</label>
                                <div>{this.state.nodeOsInfo.node_millix_version}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>build date</label>
                                <div>{this.state.nodeOsInfo.node_millix_build_date && moment.unix(this.state.nodeOsInfo.node_millix_build_date).format('YYYY-MM-DD HH:mm:ss')}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>browser</label>
                                <div>{this.state.browserRelease}</div>
                            </div>
                            <hr />
                            <div className={'section_title'}>
                                os
                            </div>
                            <div className={'form-group'}>
                                <label>platform</label>
                                <div>{this.state.nodeOsInfo.platform}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>type</label>
                                <div>{this.state.nodeOsInfo.type}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>release</label>
                                <div>{this.state.nodeOsInfo.release}</div>
                            </div>
                            <hr />
                            <div className={'section_title'}>
                                hardware
                            </div>
                            <div className={'form-group'}>
                                <label>arch</label>
                                <div>{this.state.nodeOsInfo.arch}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>memory total</label>
                                <div>{this.state.nodeOsInfo.memory.total}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>memory free</label>
                                <div>{this.state.nodeOsInfo.memory.free} ({this.state.nodeOsInfo.memory.freePercent})</div>
                            </div>
                            <div className={'form-group'}>
                                <label>cpu</label>
                                <div>{this.state.nodeOsInfo.cpu.model}</div>
                            </div>
                            <div className={'form-group'}>
                                <label>cpu load average</label>
                                <div>{this.state.nodeOsInfo.cpu.loadavg.join(' ')}</div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        clock  : state.clock,
        config : state.config,
        log    : state.log,
        network: state.network,
        wallet : state.wallet,
        backlog: state.backlog,
        node   : state.node
    }), {
        updateNetworkState
    })(withRouter(ReportIssueView));
