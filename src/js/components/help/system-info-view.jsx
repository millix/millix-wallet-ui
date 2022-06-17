import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col, Row, Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../../redux/actions';
import os from 'os';
import API from '../../api';
import * as format from '../../helper/format';
import HelpIconView from './../utils/help-icon-view';
import Translation from '../../common/translation';


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
                    {Translation.getPhrase('8f9df8a04')}
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <Col>
                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        {Translation.getPhrase('5afb36415')}
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('a84b519b0')}
                                            </td>
                                            <td>
                                                {props.network.node_id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('e2fd99059')}<HelpIconView
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
                                        {Translation.getPhrase('5fa8b6429')}
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('e4065c1d6')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.node_millix_version}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('ba07da8bb')}
                                            </td>
                                            <td>
                                                {format.date(this.state.node_os_info.node_millix_build_date)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('1ff167e09')}
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
                                        {Translation.getPhrase('704335ffa')}
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('7ced67593')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.platform}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('607744dc0')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.type}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('cb4b33640')}
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
                                        {Translation.getPhrase('039b2ab88')}
                                    </div>
                                    <Table striped bordered hover
                                           className={'mb-0'}>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('c73f78dcc')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.arch}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('d5c0a0677')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.memory.total}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('fc0869127')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.memory.free} ({this.state.node_os_info.memory.freePercent})
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('d3d3e029e')}
                                            </td>
                                            <td>
                                                {this.state.node_os_info.cpu.model}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                {Translation.getPhrase('b9f07a993')}
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
