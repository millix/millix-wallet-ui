import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import os from 'os';
import API from '../../api';
import {updateNetworkState} from '../../redux/actions';
import * as format from '../../helper/format';
import {Col, Row} from 'react-bootstrap';
import MessageComposeForm from '../message/message-compose-form';
import {DISCORD_URL, REPORT_ISSUE_ADDRESS} from '../../../config.js';
import Translation from '../../common/translation';


class ReportIssueView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: Translation.getPhrase('09959a949')
        };
    }

    componentDidMount() {
        API.getNodeOsInfo().then(node_os_info => {
            this.setReportMessage(node_os_info);
        });
    }

    setReportMessage(node_os_info) {
        this.setState({
            message: `\n\n-----------------------------\n\nnode:
    node id - ${this.props.network.node_id};
    key identifier - ${this.props.wallet.address_key_identifier}
    build - ${node_os_info.node_millix_version}
    build date - ${format.date(node_os_info.node_millix_build_date)}
    browser - ${os.release()}
os:
    platform - ${node_os_info.platform}
    type - ${node_os_info.type}
    release - ${node_os_info.release}
hardware:
    architecture - ${node_os_info.arch}
    memory total - ${node_os_info.memory.total}
    memory free - ${node_os_info.memory.free} (${node_os_info.memory.freePercent})
    cpu - ${node_os_info.cpu.model}
    cpu load average - ${node_os_info.cpu.loadavg.join(' ')}
        `
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>{Translation.getPhrase('7d765ea09')}</div>
                            <div className={'panel-body'}>
                                <p>
                                    {Translation.getPhrase('13d321885', {
                                        discord_link:
                                            <a href={DISCORD_URL} target={'_blank'} rel="noreferrer">discord</a>
                                    })}
                                </p>
                                <MessageComposeForm
                                    message={this.state.message}
                                    subject={`${this.props.wallet.address_key_identifier} issue report`}
                                    destination_address={REPORT_ISSUE_ADDRESS}
                                    amount={1000}
                                    input_label_message={Translation.getPhrase('414d5b031')}
                                    hidden_field_list={[
                                        'address',
                                        'subject',
                                        'amount',
                                        'fee',
                                        'verified_sender'
                                    ]}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        network: state.network,
        wallet : state.wallet,
        config : state.config
    }), {
        updateNetworkState
    })(withRouter(ReportIssueView));
