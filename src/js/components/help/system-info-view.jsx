import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col, Row, Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../../redux/actions';
import os from 'os';
import API from '../../api';
import * as format from '../../helper/format';
import HelpIconView from './../utils/help-icon-view';


class SystemInfoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            node_os_info  : {
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
                node_os_info: response
            });
        });
    }

    render() {
        const props = this.props;

        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    system info
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <Col>
                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        node
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                node id
                                            </td>
                                            <td>
                                                {props.network.node_id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                key identifier<HelpIconView
                                                help_item_name={'key_identifier'}/>
                                            </td>
                                            <td>
                                                {props.wallet.address_key_identifier}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        version
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                build
                                            </td>
                                            <td>
                                                {this.state.node_os_info.node_millix_version}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                build date
                                            </td>
                                            <td>
                                                {format.date(this.state.node_os_info.node_millix_build_date)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                browser
                                            </td>
                                            <td>
                                                {this.state.browserRelease}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        os
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                platform
                                            </td>
                                            <td>
                                                {this.state.node_os_info.platform}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                type
                                            </td>
                                            <td>
                                                {this.state.node_os_info.type}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                release
                                            </td>
                                            <td>
                                                {this.state.node_os_info.release}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        hardware
                                    </div>
                                    <Table striped bordered hover
                                           className={'mb-0'}>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                architecture
                                            </td>
                                            <td>
                                                {this.state.node_os_info.arch}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                memory total
                                            </td>
                                            <td>
                                                {this.state.node_os_info.memory.total}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                memory free
                                            </td>
                                            <td>
                                                {this.state.node_os_info.memory.free} ({this.state.node_os_info.memory.freePercent})
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                cpu
                                            </td>
                                            <td>
                                                {this.state.node_os_info.cpu.model}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                cpu load average
                                            </td>
                                            <td>
                                                {this.state.node_os_info.cpu.loadavg.join(' ')}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        network: state.network,
        wallet : state.wallet,
        node   : state.node
    }), {
        updateNetworkState
    })(withRouter(SystemInfoView));
